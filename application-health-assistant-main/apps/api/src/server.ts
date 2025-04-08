import fs from 'fs';
import { join } from 'path';

// Tracing import has to be set at the very top
// eslint-disable-next-line import/order
import initTracing from './trace';

import winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import helmet from 'helmet';
import { load as yamlLoad } from 'js-yaml';
import swaggerUI from 'swagger-ui-express';

import { APPLICATION_CODE } from '@app/config';

import AppModule from './app/app.module';
import FormattedExceptionFilter from './app/common/FormattedExceptionFilter';
import apiVersionHeader from './app/common/apiVersionHeader';
import cacheControlHeaders from './app/common/cacheControlHeaders';

const globalPrefix = '/api/v1';
const apiSpecLocation = join(__dirname, 'assets', 'api', 'openapi.yaml');
export const apiSpecYamlFile = fs.readFileSync(apiSpecLocation);

/**
 * Nest's inbuilt swagger support expects to generate the OpenAPI document from
 * the code. This doesn't work for our "design first" approach to APIs. The following
 * function will expose the swagger UI using an openapi.yaml file.
 * @param {NestExpressApplication} app - Instance of NestExpressApplication
 */
function addSwaggerUI(app: NestExpressApplication) {
    const schema = yamlLoad(apiSpecYamlFile.toString());
    const httpAdapter = app.getHttpAdapter();
    const swaggerHtml = swaggerUI.generateHTML(schema, {});
    app.use('/api/openapi', swaggerUI.serveFiles(schema, {}));
    httpAdapter.get('/api/openapi', (_req: Request, res: Response) => res.send(swaggerHtml));
    httpAdapter.get('/api/openapi.yaml', (_req: Request, res: Response) => {
        res.type('.yaml');
        res.send(apiSpecYamlFile);
    });
}

export const customOrigin = (origin, callback) => {
    if (!origin) {
        callback(null, true);
        return;
    }
    const originHostName = new URL(origin).hostname;
    if (originHostName === 'localhost' || originHostName.endsWith('oss2.mrshmc.com')) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
};

/**
 * Initializes the Winston Logger by generating the  LoggingOptions based upon
 * the supplied environment variables.
 * @param {Record<string, string>} env The environment variables.
 */
export function initializeLogger(env: Record<string, string>) {
    /**
     * Converts a comma separated string to an array of strings.
     * @param {string} value - The comma separated string.
     * @returns {string[]} The parsed array of strings.
     */
    function convertStringToArray(value: string) {
        return value
            .toLowerCase()
            .split(',')
            .map((item) => item.trim()) // Remove whitespace.
            .filter(Boolean); // Remove empty strings.
    }

    const loggingOptions = {
        level: env.LOG_LEVEL ?? 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            env.LOG_PRETTY_FORMAT === 'true'
                ? nestWinstonModuleUtilities.format.nestLike(APPLICATION_CODE, {
                      colors: true,
                      prettyPrint: true,
                  })
                : winston.format.json()
        ),
        transports: [new winston.transports.Console()],
    };

    if (env.LOG_INCLUDE_TIMESTAMP !== undefined) {
        loggingOptions.format = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            loggingOptions.format
        );
    }

    return winston.createLogger(loggingOptions);
}

/**
 * Bootstraps the Nest.js application by initializing the environment logging,
 * creating the Nest.js application, setting the global prefix, adding middleware,
 * adding global filters, and starting the Express server.
 */
export default async function bootstrap() {
    // Provide the Logger with configuration before starting the app bootstrap.
    const logger = initializeLogger(process.env);

    logger.log('info', 'Initializing Nest Application');
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: {
            origin: customOrigin,
            exposedHeaders: ['Location'],
            methods: ['GET', 'PUT', 'POST', 'DELETE'],
        },
        logger: winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike(APPLICATION_CODE, {
                    colors: true,
                    prettyPrint: true,
                })
            ),
            transports: [new winston.transports.Console()],
        }),
    });
    const configService = app.get(ConfigService);

    // Enable APM tracing
    initTracing.bind(configService)();

    logger.log('info', 'Adding global prefix');
    app.setGlobalPrefix(globalPrefix);

    // Middleware - parser middleware would typically be registered during `app.listen` but is
    // instead registered before the logger middleware as body-parser is not compatible with
    // AsyncLocalStorage. <https://github.com/expressjs/body-parser/issues/422>
    logger.log('info', 'Adding parser middleware');
    (<NestApplication>(<unknown>app)).registerParserMiddleware();
    logger.log('info', 'Adding logger middleware');
    app.use((req, res, next) => {
        logger.log('info', `${req.method} ${req.url}`);
        next();
    });
    logger.log('info', 'Adding helmet middleware');
    app.use(
        helmet({
            contentSecurityPolicy: true,
        })
    );

    const useFrameguardMiddleware = configService.get<string>('USE_FRAMEGUARD_MIDDLEWARE');
    if (useFrameguardMiddleware) {
        app.use(helmet.frameguard({ action: 'sameorigin' }));
    }

    const useHstsMiddleware = configService.get<string>('USE_HSTS_MIDDLEWARE');
    if (useHstsMiddleware) {
        app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
    }

    logger.log('info', 'Adding API versioning');
    app.use(apiVersionHeader(configService.get<string>('BUILD_VERSION')));
    logger.log('info', 'Adding cache control headers');
    app.use(cacheControlHeaders);

    // Exception handling
    logger.log('info', 'Adding global filters');
    app.useGlobalFilters(new FormattedExceptionFilter());

    logger.log('info', 'Adding swagger UI');
    addSwaggerUI(app);

    logger.log('info', 'Starting Express server listening');
    // If port doesn't exist in the config service use default
    const port = configService.get<number>('API_PORT') || 8080;
    await app.listen(port);

    logger.log('info', `Listening at http://localhost:${port}${globalPrefix}`);
}