import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import Joi from 'joi';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import AppController from './app.controller';
import AppService from './app.service';
import { GitAuthModule } from './git-auth.module';
import ApplicationDtlsModule from '../applicationDtls/applicationDtls.module';
import EngineInputsModule from '../engineInputs/engineInputs.module';
import EngineOutputsModule from '../engineOutputs/engineOutputs.module';
import FeedbacksModule from '../feedback/feedbacks.module';
import FileContentsModule from '../fileContents/fileContents.module';
import HealthModule from '../health/health.module';
import IssueDetailsModule from '../issueDetails/issueDetails.module';
import PromptLibrarysModule from '../promptLibrary/promptLibrarys.module';
import PullRequestLogsModule from '../pullRequestLog/pullRequestLogs.module';
import RetensionObjectDetailsModule from '../retensionObjectDetails/retensionObjectDetails.module';
import TasksModule from '../tasks/tasks.module';
import UsermsModule from '../userm/userms.module';
import EmailModule from './common/EmailModule';
import OktaGuard from './common/auth-guards/oktaGuard.service';

export const configSchema = Joi.object({
    API_MONGODB_DB_URL: Joi.string(),
    API_MONGO_PW: Joi.string(),
    API_MSSQL_PW: Joi.string(),
    API_MSSQL_DB_URL: Joi.string(),
    BUILD_VERSION: Joi.string().default('0.0.1'),
    PREFIX_MONGO_COLLECTION_WITH_PROJECT_KEY: Joi.string(),
    PORT: Joi.number().integer().default(8080),
    //APIGEE_ORGANIZATION: Joi.string().required(),
    //APIGEE_CLIENT_ID: Joi.string().required(),
});

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: configSchema,
        }),
        WinstonModule.forRoot({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'combined.log' }),
            ],
        }),
        TasksModule,
        HealthModule,
        IssueDetailsModule,
        ApplicationDtlsModule,
        EngineInputsModule,
        EngineOutputsModule,
        FileContentsModule,
        PromptLibrarysModule,
        RetensionObjectDetailsModule,
        PullRequestLogsModule,
        FeedbacksModule,
        UsermsModule,
        EmailModule,
        GitAuthModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        //{
          //  provide: APP_GUARD,
           // useClass: OktaGuard,
        //},
    ],
})
export default class AppModule {}