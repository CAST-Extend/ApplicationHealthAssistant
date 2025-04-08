import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { createLogger, format, transports } from 'winston';

import OktaGuard from './oktaGuard.service';

jest.mock('fs');

let service: OktaGuard;
let mockLogger: MockProxy<ReturnType<typeof createLogger>>;
let mockConfig: MockProxy<ConfigService>;

beforeEach(async () => {
    mockLogger = mock<ReturnType<typeof createLogger>>();
    mockConfig = mock<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            OktaGuard,
            { provide: 'Logger', useValue: mockLogger }, // Use a string token for Winston logger
            { provide: ConfigService, useValue: mockConfig },
        ],
    }).compile();

    service = module.get<OktaGuard>(OktaGuard);
});

it('Should be defined', () => {
    expect(service).toBeDefined();
});

describe('OktaGuard', () => {
    it('Should get config', () => {
        expect(mockConfig.get).toHaveBeenCalledTimes(2);

        expect(mockConfig.get).toHaveBeenNthCalledWith(1, 'APIGEE_ORGANIZATION');
        expect(mockConfig.get).toHaveBeenNthCalledWith(2, 'APIGEE_CLIENT_ID');
    });

    it('should throw UnauthorizedException when token is not Bearer', async () => {
        const context = {
            getClass: jest.fn(),
            getHandler: jest.fn(),
            switchToHttp: jest.fn(() => ({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: 'test token',
                    },
                }),
            })),
        } as never;

        await expect(service.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});