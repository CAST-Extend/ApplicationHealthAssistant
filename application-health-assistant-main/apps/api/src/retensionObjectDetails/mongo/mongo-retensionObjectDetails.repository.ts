import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreateRetensionObjectDetailRequest,
    RetensionObjectDetailBase,
} from '@application-health-assistant/shared-api-model/model/retensionObjectDetails';

import MongoRepository from '../../repository/mongo/mongo-repository';
import sampleRetensionObjectDetails from '../initData';
import { RetensionObjectDetailRepository } from '../retensionObjectDetails.repository';
import { RetensionObjectDetail } from '../schemas/RetensionObjectDetails.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoRetensionObjectDetailRepository
    extends MongoRepository
    implements RetensionObjectDetailRepository
{
    RetensionObjectDetailCollection: Collection;

    collectionName = 'RetensionObjectDetails';

    public logger = createLogger({
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
     * Retrieves a single RetensionObjectDetail by its ID
     * @param {object} RetensionObjectDetailID - The id of the RetensionObjectDetail to be found
     * @returns {Promise<RetensionObjectDetail>} - A promise that resolves to a RetensionObjectDetail object
     */
    async findOne(RetensionObjectDetailID): Promise<RetensionObjectDetail> {
        const { _id: id } = RetensionObjectDetailID;
        const retensionObjectDetail = await (
            await this.getCollection<RetensionObjectDetail>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    id: '$_id',
                    issueId: '12345',
                    applicationid: 'test',
                    retensionObjectId: [],
                    createdDate: '2024-10-17T12:00:09.964Z',
                },
            }
        );

        return retensionObjectDetail;
    }

    /**
     * Retrieves all RetensionObjectDetails
     * @returns {Promise<RetensionObjectDetail[]>} - A promise that resolves to an array of RetensionObjectDetail objects
     */
    async findAll(): Promise<RetensionObjectDetail[]> {
        const retensionObjectDetails = (await (
            await this.getCollection<RetensionObjectDetail>(this.collectionName)
			)
            .find()
            .toArray()) as RetensionObjectDetail[];

        return retensionObjectDetails.map(
            (retensionObjectDetail: RetensionObjectDetail & MongoDbId) => {
                /* eslint-disable no-underscore-dangle, no-param-reassign */
                const id = String(retensionObjectDetail._id);

                delete retensionObjectDetail._id;
                return { ...retensionObjectDetail, id };
                /* eslint-enable no-underscore-dangle, no-param-reassign */
            }
        );
    }

    /**
     * Update one RetensionObjectDetail with New RetensionObjectDetail object and corresponding RetensionObjectDetail ID.
     * @param {object} RetensionObjectDetailID - The id of the RetensionObjectDetail to be updated
     * @param retensionObjectDetailID
     * @param {RetensionObjectDetailBase} entity - The new properties for the RetensionObjectDetail
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(retensionObjectDetailID, entity: RetensionObjectDetailBase): Promise<number> {
        const { _id: id } = retensionObjectDetailID;
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
     * Deletes a single RetensionObjectDetail from the database by its RetensionObjectDetailID
     * @param {string} RetensionObjectDetailID - The id of the RetensionObjectDetail to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the RetensionObjectDetail was successfully deleted
     */
    async deleteOne(RetensionObjectDetailID): Promise<boolean> {
        const { _id: id } = RetensionObjectDetailID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new RetensionObjectDetail in the database
     * @param {CreateRetensionObjectDetailRequest} retensionObjectDetail - The RetensionObjectDetail information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created RetensionObjectDetail
     */
    async create(retensionObjectDetail: CreateRetensionObjectDetailRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<RetensionObjectDetailBase>(this.collectionName)
        ).insertOne({ ...retensionObjectDetail, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all RetensionObjectDetails
     * @returns {Promise<number>} Number of deleted RetensionObjectDetails.
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

        await this.populateRetensionObjectDetailsIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as RetensionObjectDetails, and it validates the documents against the JSON Schema before inserting.
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
                        required: ['issueId', 'applicationid', 'retensionObjectId', 'createddate'],
                        properties: {
                            issueId: {
                                bsonType: 'string',
                                description: 'issue id is required field',
                            },
                            applicationid: {
                                bsonType: 'string',
                                description: 'application id is required field',
                            },
                            retensionObjectId: {
                                bsonType: 'array',
                                description: 'objects is required field',
                            },
                            createddate: {
                                bsonType: 'string',
                                description: 'created date is required field',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named sampleRetensionObjectDetails and the number of documents inserted is logged.
     */
    async populateRetensionObjectDetailsIfUnavailable() {
        this.logger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const RetensionObjectDetailCollection = await this.getCollection<
            RetensionObjectDetailBase & MongoDbId
        >(this.collectionName);
        const RetensionObjectDetailCount = (await RetensionObjectDetailCollection.find().toArray())
            .length;
        if (RetensionObjectDetailCount < 3) {
            const RetensionObjectDetailWithObjectId = sampleRetensionObjectDetails.map(
                (retensionObjectDetail) => ({
                    ...retensionObjectDetail,
                    // eslint-disable-next-line no-underscore-dangle
                    _id: new ObjectId(retensionObjectDetail._id),
                })
            );
            const { insertedCount } = await RetensionObjectDetailCollection.insertMany(
                RetensionObjectDetailWithObjectId
            );

            this.logger.info(
                `[${insertedCount}] documents were populated in the RetensionObjectDetail collection`
            );
        }
    }
}