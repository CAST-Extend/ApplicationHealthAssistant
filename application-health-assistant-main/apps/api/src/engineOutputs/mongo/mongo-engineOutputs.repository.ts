import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';


import {
    CreateEngineOutputRequest,
    EngineOutputBase,
} from '@application-health-assistant/shared-api-model/model/engineOutputs';

import MongoRepository from '../../repository/mongo/mongo-repository';
import { EngineOutputRepository } from '../engineOutputs.repository';
import sampleEngineOutputs from '../initData';
import { EngineOutput } from '../schemas/Engineoutputs.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoEngineOutputRepository
    extends MongoRepository
    implements EngineOutputRepository
{
    EngineOutputCollection: Collection;

    collectionName = 'EngineOutput';

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
            new transports.File({ filename: 'mongo-engine-output-repository.log' }),
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
     * Retrieves a single EngineOutput by its ID
     * @param {object} EngineOutputID - The id of the EngineOutput to be found
     * @returns {Promise<EngineOutput>} - A promise that resolves to a EngineOutput object
     */
    async findOne(EngineOutputID): Promise<EngineOutput> {
        const { _id: id } = EngineOutputID;
        const engineOutput = await (
            await this.getCollection<EngineOutput>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    id: '$_id',
                    issueid: '12345',
                    requestid: '66fc114c01b7b08905f87999',
                    applicationid: 'test',
                    objects: [],
                    contentinfo: [],
                    status: 'success',
                    createddate: '2024-11-05_16-30-25',
                },
            }
        );

        return engineOutput;
    }

    /**
     * Retrieves all EngineOutputs
     * @returns {Promise<EngineOutput[]>} - A promise that resolves to an array of EngineOutput objects
     */
    async findAll(): Promise<EngineOutput[]> {
        const engineOutputs = (await (await this.getCollection<EngineOutput>(this.collectionName))
            .find()
            .toArray()) as EngineOutput[];

        return engineOutputs.map((engineOutput: EngineOutput & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(engineOutput._id);

            delete engineOutput._id;
            return { ...engineOutput, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one EngineOutput with New EngineOutput object and corresponding EngineOutput ID.
     * @param {object} EngineOutputID - The id of the EngineOutput to be updated
     * @param engineOutputID
     * @param {EngineOutputBase} entity - The new properties for the EngineOutput
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(engineOutputID, entity: EngineOutputBase): Promise<number> {
        const { _id: id } = engineOutputID;

        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: ObjectId.createFromTime(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single EngineOutput from the database by its EngineOutputID
     * @param {string} EngineOutputID - The id of the EngineOutput to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the EngineOutput was successfully deleted
     */
    async deleteOne(EngineOutputID): Promise<boolean> {
        const { _id: id } = EngineOutputID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new EngineOutput in the database
     * @param {CreateEngineOutputRequest} engineOutput - The EngineOutput information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created EngineOutput
     */
    async create(engineOutput: CreateEngineOutputRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<EngineOutputBase>(this.collectionName)
        ).insertOne({ ...engineOutput, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all EngineOutputs
     * @returns {Promise<number>} Number of deleted EngineOutputs.
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

        await this.populateEngineOutputsIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as EngineOutputs, and it validates the documents against the JSON Schema before inserting.
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
                        required: ['requestid', 'objects', 'contentinfo'],
                        properties: {
                            requestid: {
                                bsonType: 'string',
                                description: 'Request id is required field',
                            },
                            issueid: {
                                bsonType: 'string',
                                description: 'issue id is required field',
                            },
                            applicationid: {
                                bsonType: 'string',
                                description: 'application id is required field',
                            },
                            objects: {
                                bsonType: 'array',
                                description: 'objects is required field',
                            },
                            contentinfo: {
                                bsonType: 'array',
                                description: 'contentinfo is required field',
                            },
                            status: {
                                bsonType: 'string',
                                description: 'status is required field',
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
     * The sample data is stored in a constant named sampleEngineOutputs and the number of documents inserted is logged.
     */
    async populateEngineOutputsIfUnavailable() {
        this.logger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const EngineOutputCollection = await this.getCollection<EngineOutputBase & MongoDbId>(
            this.collectionName
        );
        const EngineOutputCount = (await EngineOutputCollection.find().toArray()).length;
        if (EngineOutputCount < 3) {
            const EngineOutputWithObjectId = sampleEngineOutputs.map((engineOutput) => ({
                ...engineOutput,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(engineOutput._id),
            }));
            const { insertedCount } =
                await EngineOutputCollection.insertMany(EngineOutputWithObjectId);

            this.logger.info(
                `[${insertedCount}] documents were populated in the EngineOutput collection`
            );
        }
    }
}