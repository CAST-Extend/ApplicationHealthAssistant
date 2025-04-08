/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable import/prefer-default-export */
// auth.service.ts
import { createLogger, format, transports } from 'winston';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import {
    ApplicationComponent,
    IdentityProvider,
    AuthenticationChannel,
} from '@application-health-assistant/shared-api-model/constants/siem-logging';

import environment from '../environments/environment';

@Injectable()
export class GitAuthService {
	
    private readonly logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/auth.log' })
        ],
    });

    /**
     *
     * @param configService
     * @param httpService
     */
    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) {}

    /**
     *
     * @param code
     */
    async handleGitCallback(code: string): Promise<any> {
        const clientId = environment.UI_GitHubClientId;
        const clientSecret = environment.UI_GitHubClientSecret;

        try {
            const tokenResponse = await firstValueFrom(
                this.httpService.post(
                    'https://github.com/login/oauth/access_token',
                    new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code,
                    }).toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Accept: 'application/json',
                        },
                    }
                )
            );
            this.logger.info('Authentication with the API successful.', {
                context: 'GitHub SSO via [https://github.com/login/oauth/access_token].',
                applicationComponent: ApplicationComponent.OKTA_GUARD,
                identityProvider: IdentityProvider.OKTA,
                authenticationChannel: AuthenticationChannel.SSO,
            });
            return tokenResponse.data;
        } catch (error) {
            this.logger.error('Authentication with the API failed.', {
                context: 'GitHub SSO via [https://github.com/login/oauth/access_token].',
                applicationComponent: ApplicationComponent.OKTA_GUARD,
                identityProvider: IdentityProvider.OKTA,
                authenticationChannel: AuthenticationChannel.SSO,
                error: error.message,
            });
            throw new Error(`Failed to retrieve access token: ${error.message}`);
        }
    }
}