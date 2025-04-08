import fs from 'fs/promises';
import { createLogger, format, transports } from 'winston';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing/test';
import { mock, MockProxy } from 'jest-mock-extended';
import { when } from 'jest-when';
import * as mongo from 'mongodb';

import { PROJECT_NAME } from '@app/config';

import MongoRepository from './mongo-repository';

jest.mock('mongodb');
jest.mock('fs/promises');
jest.mock('fs');

const { MongoClient } = mongo;

let repository: MongoRepository;
let mockConfigService: MockProxy<ConfigService>;
let mockLogger: ReturnType<typeof createLogger>;
const mockMongoClient = jest.spyOn(MongoClient.prototype, 'connect');
const mockMongoDb = jest.spyOn(MongoClient.prototype, 'db');
const dbMock = {
    command(param) {
        return param;
    },
    collection(param) {
        return param;
    },
};
dbMock.command = jest.fn();

beforeEach(async () => {
    // Initialize winston logger
    mockLogger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/combined.log' }),
        ],
    });

    const get = jest.fn();
    when(get)
        .calledWith('API_MONGODB_API_DB_URL')
        .mockReturnValue('mongodb://db:27017')
        .calledWith('API_DATASTORE_NAME')
        .mockReturnValue('app');
    mockConfigService = mock<ConfigService>({ get });

    const app = await Test.createTestingModule({
        providers: [
            MongoRepository,
            {
                provide: ConfigService,
                useValue: mockConfigService,
            },
            {
                provide: 'Logger', // Use a string token for the logger
                useValue: mockLogger,
            },
        ],
    }).compile();

    repository = app.get<MongoRepository>(MongoRepository);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('mongoRepositoryTest', () => {
    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    it('should connect to mongo DB when no certificate is required', async () => {
        mockMongoClient.mockResolvedValueOnce(jest.fn as never);
        mockMongoDb.mockResolvedValueOnce(dbMock as never);
        const actualConnection = await repository.getDatabase();
        expect(actualConnection).toStrictEqual(dbMock);
        expect(mockMongoClient).toHaveBeenCalledTimes(1);
        expect(mockMongoDb).toHaveBeenCalledTimes(1);
    });

    /*
    it('should connect to mongo DB when a certificate is required and provided', async () => {
        mockMongoClient.mockResolvedValueOnce(jest.fn as never);
        mockMongoDb.mockResolvedValueOnce(dbMock as never);
        mockConfigService.get.mockReturnValueOnce('this is a mock certificate value');
        const writeFileMock = jest.spyOn(fs, 'writeFile').mockResolvedValueOnce();
        const mongoClientMock = jest.spyOn(mongo, 'MongoClient');

        const actualConnection = await repository.getDatabase();

        expect(actualConnection).toStrictEqual(dbMock);
        expect(mockMongoClient).toHaveBeenCalledTimes(1);
        expect(mockMongoDb).toHaveBeenCalledTimes(1);

        expect(writeFileMock).toHaveBeenCalledTimes(1);
        expect(writeFileMock).toHaveBeenCalledWith(
            './MongoCert.pem',
            'this is a mock certificate value'
        );
        expect(mongoClientMock).toHaveBeenCalledWith('mongodb://db:27017', {
            tlsCAFile: './MongoCert.pem',
        });
    });
    */

    it('should NOT connect to mongo DB when a certificate is provided but an error occurs writing it to a file', async () => {
        mockMongoClient.mockResolvedValueOnce(jest.fn as never);
        mockMongoDb.mockResolvedValueOnce(dbMock as never);
        mockConfigService.get.mockReturnValueOnce('this is another mock certificate value');
        const writeFileMock = jest
            .spyOn(fs, 'writeFile')
            .mockRejectedValueOnce('There was an error writing to the file.');

        let actualConnection;
        let getDatabaseError;
        try {
            actualConnection = await repository.getDatabase();
        } catch (error) {
            getDatabaseError = error;
        }

        expect(getDatabaseError).toEqual(
            new Error('Unable to establish connection to the database')
        );
        expect(actualConnection).toBeUndefined();
        expect(mockMongoClient).toHaveBeenCalledTimes(0);
        expect(mockMongoDb).toHaveBeenCalledTimes(0);

        expect(writeFileMock).toHaveBeenCalledTimes(1);
        expect(writeFileMock).toHaveBeenCalledWith(
            './MongoCert.pem',
            'this is another mock certificate value'
        );
    });

    it('should get collection when invoked', async () => {
        mockMongoClient.mockResolvedValueOnce(jest.fn as never);
        mockMongoDb.mockResolvedValueOnce(dbMock as never);
        expect(await repository.getCollection('tasks')).toBe('tasks');
        expect(mockMongoClient).toHaveBeenCalledTimes(1);
        expect(mockMongoDb).toHaveBeenCalledTimes(1);
    });

    it('getCollection Should prefix collection with project key if flag is true', async () => {
        const collectionName = 'test-collection';
        mockMongoClient.mockResolvedValueOnce(jest.fn as never);
        mockMongoDb.mockResolvedValueOnce(dbMock as never);
        mockConfigService.get.mockReturnValueOnce('true');
        const newCollectionName = await repository.getCollection(collectionName);
        expect(newCollectionName).toBe(`${PROJECT_NAME}_${collectionName}`);
    });

    it('getCollection Should not prefix collection with project key if flag is not true', async () => {
        const collectionName = 'test-collection';
        mockMongoClient.mockResolvedValueOnce(jest.fn as never);
        mockMongoDb.mockResolvedValueOnce(dbMock as never);
        mockConfigService.get.mockReturnValueOnce('false');
        const newCollectionName = await repository.getCollection(collectionName);
        expect(newCollectionName).toBe(`${collectionName}`);
    });
});