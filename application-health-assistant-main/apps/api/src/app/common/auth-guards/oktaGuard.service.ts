import fs from 'fs';
import https from 'node:https';
import { join } from 'path';

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import OktaJwtVerifier from '@okta/jwt-verifier';
import { createLogger, format, transports } from 'winston';

import {
    ApplicationComponent,
    AuthenticationChannel,
    IdentityProvider,
} from '@application-health-assistant/shared-api-model/constants/siem-logging';

import { isWhiteListedController } from '../allowControllerWithNoBearer';

@Injectable()
export default class OktaGuard implements CanActivate {
    oktaJwtVerifier: OktaJwtVerifier;

    organization: string;

    clientId: string;

    audience: string;

    private logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json(),
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'combined.log' }),
        ],
    });

    /**
     * @param {ConfigService} configService - instance of configuration service
     * @param {Reflector} reflector - Reflection function from NestJS
     */
    constructor(
        configService: ConfigService,
        private reflector: Reflector
    ) {
        this.getConfig(configService);
    }

    /**
     * Asynchronously determines whether the request is authorized to access the route or resource.
     * @param {ExecutionContext} context - The context containing the request and response objects.
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the request is authorized.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const AUTH_HEADER_PREFIX = 'BEARER';

        return new Promise<boolean>((resolve, reject) => {
            let token: string;
            try {
                this.logger.info('Authentication started');

                // This method checks the context of the request and resolves if AllowControllerWithNoBearer
                // decorator is used on that controller or specific route handler.
                if (isWhiteListedController(context, this.reflector)) {
                    resolve(true);
                    return;
                }

                token = this.getAuthToken(context, AUTH_HEADER_PREFIX);

                this.validateOktaToken(token, resolve, reject);
            } catch (error) {
                this.logger.error('Authentication Failed', { error });
                if (error.message) {
                    reject(new UnauthorizedException(error.message));
                }
                reject(new UnauthorizedException());
            }
        });
    }

    /**
     * Validates an Okta access token using the Okta JWT verifier.
     * @param {string} token - The Okta access token to validate.
     * @param {(value: boolean | PromiseLike<boolean>) => void} resolve - The function to call when the token is successfully validated.
     * @param {(reason) => void} reject - The function to call when there is an error validating the token.
     */
    private validateOktaToken(
        token: string,
        resolve: (value: boolean | PromiseLike<boolean>) => void,
        reject: (reason?) => void
    ) {
        this.oktaJwtVerifier
            .verifyAccessToken(token, this.audience)
            .then((oktaResponse: OktaJwtVerifier.Jwt) => {
                this.logger.info(
                    `Successfully verified user [${oktaResponse.claims.employee_id}] with following Email ID - [${oktaResponse.claims.email}]`,
                    {
                        ad_user_name: oktaResponse.claims?.ad_user_name,
                        okta_user_id: oktaResponse.claims?.okta_user_id,
                        employee_id: oktaResponse.claims?.employee_id,
                        app_name: oktaResponse.claims?.app_name,
                    }
                );

                this.logger.info('Authentication with the API was successful.', {
                    context: `Okta SSO via [${this.audience}] for user [${oktaResponse.claims.sub}].`,
                    applicationComponent: ApplicationComponent.OKTA_GUARD,
                    identityProvider: IdentityProvider.OKTA,
                    authenticationChannel: AuthenticationChannel.SSO,
                });
                resolve(true);
            })
            .catch((error) => {
                this.logger.error('There was an error validating a token', { error });
                if (error.message) {
                    reject(new UnauthorizedException(error.message));
                }

                reject(new UnauthorizedException('Authentication failed'));
            });
    }

    /**
     * Retrieves the authorization token from the request headers.
     * @param {ExecutionContext} context - The context containing the request and response objects.
     * @param {string} AUTH_HEADER_PREFIX - The prefix for the authorization header (e.g. "BEARER").
     * @returns {string} - The authorization token.
     * @throws {UnauthorizedException} - If the authorization header is missing or invalid.
     */
    private getAuthToken(context: ExecutionContext, AUTH_HEADER_PREFIX: string) {
        try {
            const token = context
                .getArgs()[0]
                .headers?.authorization.slice(AUTH_HEADER_PREFIX.length)
                .trim();
            return token;
        } catch (error) {
            this.logger.error('Failed retrieving token from headers', { error });
            throw new UnauthorizedException('Missing or invalid authentication header');
        }
    }

    /**
     * Loads the necessary configuration values from the config service.
     * @param {ConfigService<Record<string, unknown>, false>} configService - The config service providing the necessary configuration values.
     */
    private getConfig(configService: ConfigService<Record<string, unknown>>) {
        this.organization = configService.get<string>('APIGEE_ORGANIZATION');
        this.clientId = configService.get<string>('APIGEE_CLIENT_ID');
        this.audience = `https://${this.organization}-ingress.mgti.mmc.com`;
        this.oktaJwtVerifier = new OktaJwtVerifier({
            issuer: `${this.audience}/authentication/v1`,
            clientId: this.clientId,
            requestAgent: new https.Agent({
                cert: fs.readFileSync(
                    join(__dirname, 'assets', 'tls-local', 'access-management', 'cert.pem'),
                    'utf-8'
                ),
            }),
        });
    }
}