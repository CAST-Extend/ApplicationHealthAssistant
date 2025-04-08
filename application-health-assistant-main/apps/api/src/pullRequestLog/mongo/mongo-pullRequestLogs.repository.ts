import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreatePullRequestLogRequest,
    PullRequestLogBase,
} from '@application-health-assistant/shared-api-model/model/pullRequestLogs';

import MongoRepository from '../../repository/mongo/mongo-repository';
// import samplePullRequestLogs from '../initData';
import { PullRequestLogRepository } from '../pullRequestLogs.repository';
import { PullRequestLog } from '../schemas/PullRequestLogs.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoPullRequestLogRepository
    extends MongoRepository
    implements PullRequestLogRepository
{
    PullRequestLogCollection: Collection;

    collectionName = 'GitHubPullRequest';

    private readonly childLogger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}] ${message}`;
            })
        ),
        transports: [
            new transports.Console(),
        ],
    });

    /**
     * @param {ConfigService} configService - A service class that provides access to application configuration values to read from secrets and environmental variables.
     */
    constructor(
        configService: ConfigService
    ) {
        super(configService);
    }

    /**
     * Retrieves a single PullRequestLog by its ID
     * @param {object} PullRequestLogID - The id of the PullRequestLog to be found
     * @returns {Promise<PullRequestLog>} - A promise that resolves to a PullRequestLog object
     */
    async findOne(PullRequestLogID): Promise<PullRequestLog> {
        const { _id: id } = PullRequestLogID;
        const pullRequestLog = await (
            await this.getCollection<PullRequestLog>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    issueId: '12345',
                    requestId: '12345',
                    applicationId: 'test',
                    createddate: '2024-10-17T12:00:09.964Z',
                    pr_details: 'https://github.com/mmctech/mercer-CLNPAR/tree/Dev',
                    username: 'xxx.xx@mmc.com',
                },
            }
        );

        return pullRequestLog;
    }

    /**
     * Retrieves all PullRequestLogs
     * @returns {Promise<PullRequestLog[]>} - A promise that resolves to an array of PullRequestLog objects
     */
    async findAll(): Promise<PullRequestLog[]> {
        const pullRequestLogs = (await (
            await this.getCollection<PullRequestLog>(this.collectionName)
        )
            .find()
            .toArray()) as PullRequestLog[];

        return pullRequestLogs.map((pullRequestLog: PullRequestLog & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(pullRequestLog._id);

            delete pullRequestLog._id;
            return { ...pullRequestLog, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one PullRequestLog with New PullRequestLog object and corresponding PullRequestLog ID.
     * @param {object} PullRequestLogID - The id of the PullRequestLog to be updated
     * @param pullRequestLogID
     * @param {PullRequestLogBase} entity - The new properties for the PullRequestLog
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(pullRequestLogID, entity: PullRequestLogBase): Promise<number> {
        const { _id: id } = pullRequestLogID;
        // const resp = await (
        //     await this.getCollection(this.collectionName)
        // ).findOneAndReplace({ _id: ObjectId.createFromTime(id) }, entity);
        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: new ObjectId(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single PullRequestLog from the database by its PullRequestLogID
     * @param {string} PullRequestLogID - The id of the PullRequestLog to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the PullRequestLog was successfully deleted
     */
    async deleteOne(PullRequestLogID): Promise<boolean> {
        const { _id: id } = PullRequestLogID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new PullRequestLog in the database
     * @param {CreatePullRequestLogRequest} pullRequestLog - The PullRequestLog information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created PullRequestLog
     */
    async create(pullRequestLog: CreatePullRequestLogRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<PullRequestLogBase>(this.collectionName)
        ).insertOne({ ...pullRequestLog, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all PullRequestLogs
     * @returns {Promise<number>} Number of deleted PullRequestLogs.
     */
    async deleteAll(): Promise<number> {
        const resp = await (await this.getCollection(this.collectionName)).deleteMany({});
        return resp.deletedCount;
    }

    /**
     * This method is intended to simplify the setup of the initial template application.
     * This is not a pattern of implementation that is being promoted outside of the initial template.
     */
    async initDb() {
        await this.createCollectionIfNotExists();

        await this.populatePullRequestLogsIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as PullRequestLogs, and it validates the documents against the JSON Schema before inserting.
     * The schema enforces the presence of fields name, description, and priority.
     */
    // eslint-disable-next-line max-lines-per-function
    async createCollectionIfNotExists() {
        const collectionList = await (
            await this.database.listCollections().toArray()
        ).find((collection) => collection.name === this.collectionName);

        if (!collectionList) {
            this.childLogger.info(
                `The [${this.collectionName}] does not exist, creating collection [${this.collectionName}]`
            );
            this.database.createCollection(this.collectionName, {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: [
                            'issueId',
                            'requestId',
                            'applicationId',
                            'createddate',
                            'pr_details',
                            'username',
                            'createddate',
                        ],
                        properties: {
                            issueId: {
                                bsonType: 'string',
                                description: 'issue id is required field',
                            },
                            requestId: {
                                bsonType: 'string',
                                description: 'request id is required field',
                            },
                            applicationId: {
                                bsonType: 'string',
                                description: 'application id is required field',
                            },
                            createddate: {
                                bsonType: 'string',
                                description: 'created date is required field',
                            },
                            pr_details: {
                                bsonType: 'object',
                                description: 'pr_details is required field',
                            },
                            username: {
                                bsonType: 'string',
                                description: 'username is required field',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named samplePullRequestLogs and the number of documents inserted is logged.
     */
    async populatePullRequestLogsIfUnavailable() {
        this.childLogger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const PullRequestLogCollection = await this.getCollection<PullRequestLogBase & MongoDbId>(
            this.collectionName
        );
        const PullRequestLogCount = (await PullRequestLogCollection.find().toArray()).length;
        if (PullRequestLogCount < 3) {
            /* const PullRequestLogWithObjectId = samplePullRequestLogs.map((pullRequestLog) => ({
                ...pullRequestLog,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(pullRequestLog._id),
            }));
            const { insertedCount } = await PullRequestLogCollection.insertMany(
                PullRequestLogWithObjectId
            );

            this.childLogger.info(
                `[${insertedCount}] documents were populated in the PullRequestLog collection`
            ); */
        }
    }
}