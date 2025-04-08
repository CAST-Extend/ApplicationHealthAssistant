import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';


import {
    CreateIssueDetailRequest,
    IssueDetailBase,
} from '@application-health-assistant/shared-api-model/model/issueDetails';

import MongoRepository from '../../repository/mongo/mongo-repository';
import sampleIssueDetails from '../initData';
import { IssueDetailRepository } from '../issueDetails.repository';
import { IssueDetail } from '../schemas/IssueDetails.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoIssueDetailRepository
    extends MongoRepository
    implements IssueDetailRepository
{
    IssueDetailCollection: Collection;

    collectionName = 'IssueDetails';

    protected logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message, ...meta }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message} ${JSON.stringify(meta)}`;
            })
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'mongo-issue-detail-repository.log' }),
        ],
    });

    /**
     * @param {ConfigService} configService - A service class that provides access to application configuration values to read from secrets and environmental variables.
     * @param {Logger} logger - A class that provides logging functionality to stdout.
     */
    constructor(
        configService: ConfigService
    ) {
        super(configService);
    }

    /**
     * Retrieves a single IssueDetail by its ID
     * @param {object} IssueDetailID - The id of the IssueDetail to be found
     * @returns {Promise<IssueDetail>} - A promise that resolves to a IssueDetail object
     */
    async findOne(IssueDetailID): Promise<IssueDetail> {
        const { _id: id } = IssueDetailID;
        const issueDetail = await (
            await this.getCollection<IssueDetail>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            { projection: { _id: 0, id: '$_id', priority: 1, description: 1, name: 1 } }
        );

        return issueDetail;
    }

    /**
     * Retrieves a single IssueDetail by its ID
     * @param {object} aaplicationid - The id of the IssueDetail to be found
     * @returns {Promise<IssueDetail>} - A promise that resolves to a IssueDetail object
     */
    async findbyapplicationid(aaplicationid): Promise<IssueDetail> {
        const { _applicationid: applicationid } = aaplicationid;
        const issueDetail = await (
            await this.getCollection<IssueDetail>(this.collectionName)
        ).findOne(
            {
                _applicationid: new ObjectId(applicationid),
            },
            { projection: { _id: 0, id: '$_id', priority: 1, description: 1, name: 1 } }
        );

        return issueDetail;
    }

    /**
     * Retrieves all IssueDetails
     * @returns {Promise<IssueDetail[]>} - A promise that resolves to an array of IssueDetail objects
     */
    async findAll(): Promise<IssueDetail[]> {
        const issueDetails = (await (await this.getCollection<IssueDetail>(this.collectionName))
            .find()
            .toArray()) as IssueDetail[];

        return issueDetails.map((issueDetail: IssueDetail & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(issueDetail._id);

            delete issueDetail._id;
            return { ...issueDetail, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one IssueDetail with New IssueDetail object and corresponding IssueDetail ID.
     * @param {object} IssueDetailID - The id of the IssueDetail to be updated
     * @param {IssueDetailBase} entity - The new properties for the IssueDetail
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(IssueDetailID, entity: IssueDetailBase): Promise<number> {
        const { _id: id } = IssueDetailID;

        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: ObjectId.createFromTime(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single IssueDetail from the database by its IssueDetailID
     * @param {string} IssueDetailID - The id of the IssueDetail to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the IssueDetail was successfully deleted
     */
    async deleteOne(IssueDetailID): Promise<boolean> {
        const { _id: id } = IssueDetailID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new IssueDetail in the database
     * @param {CreateIssueDetailRequest} issueDetail - The IssueDetail information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created IssueDetail
     */
    async create(issueDetail: CreateIssueDetailRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<IssueDetailBase>(this.collectionName)
        ).insertOne({ ...issueDetail, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all IssueDetails
     * @returns {Promise<number>} Number of deleted IssueDetails.
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

        await this.populateIssueDetailsIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as IssueDetails, and it validates the documents against the JSON Schema before inserting.
     * The schema enforces the presence of fields name, description, and priority.
     */
    async createCollectionIfNotExists() {
        const collectionList = await (
            await this.database.listCollections().toArray()
        ).find((collection) => collection.name === this.collectionName);

        if (!collectionList) {
            this.logger.info(
                `The [${this.collectionName}] does not exist, creating collection [${this.collectionName}]`
            );
            this.database.createCollection(this.collectionName, {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['name', 'description', 'priority'],
                        properties: {
                            name: {
                                bsonType: 'string',
                                description: 'Name is required field',
                            },
                            description: {
                                bsonType: 'string',
                                description: 'Description is required field',
                            },
                            priority: {
                                bsonType: 'number',
                                minimum: 0,
                                maximum: 1000,
                                description:
                                    'priority is a required field and must be between 0 to 1000',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named sampleIssueDetails and the number of documents inserted is logged.
     */
    async populateIssueDetailsIfUnavailable() {
        this.logger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const IssueDetailCollection = await this.getCollection<IssueDetailBase & MongoDbId>(
            this.collectionName
        );
        const IssueDetailCount = (await IssueDetailCollection.find().toArray()).length;
        if (IssueDetailCount < 3) {
            const IssueDetailsWithObjectId = sampleIssueDetails.map((issueDetail) => ({
                ...issueDetail,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(issueDetail._id),
            }));
            const { insertedCount } =
                await IssueDetailCollection.insertMany(IssueDetailsWithObjectId);

            this.logger.info(
                `[${insertedCount}] documents were populated in the IssueDetail collection`
            );
        }
    }
}