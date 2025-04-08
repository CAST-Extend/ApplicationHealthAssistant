import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreateEngineInputRequest,
    EngineInputBase,
} from '@application-health-assistant/shared-api-model/model/engineInputs';

import MongoRepository from '../../repository/mongo/mongo-repository';
import { EngineInputRepository } from '../engineInputs.repository';
import sampleEngineInputs from '../initData';
import { EngineInput } from '../schemas/EngineInputs.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoEngineInputRepository
    extends MongoRepository
    implements EngineInputRepository
{
    EngineInputCollection: Collection;

    collectionName = 'EngineInput';

    private childLogger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/engine-input.log' }),
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
     * Retrieves a single EngineInput by its ID
     * @param {object} EngineInputID - The id of the EngineInput to be found
     * @returns {Promise<EngineInput>} - A promise that resolves to a EngineInput object
     */
    async findOne(EngineInputID): Promise<EngineInput> {
        const { _id: id } = EngineInputID;
        const engineInput = await (
            await this.getCollection<EngineInput>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    id: '$_id',
                    request: [],
                    Createddate: new Date(),
                },
            }
        );

        return engineInput;
    }

    /**
     * Retrieves all EngineInputs
     * @returns {Promise<EngineInput[]>} - A promise that resolves to an array of EngineInput objects
     */
    async findAll(): Promise<EngineInput[]> {
        const engineInputs = (await (await this.getCollection<EngineInput>(this.collectionName))
            .find()
            .toArray()) as EngineInput[];

        return engineInputs.map((engineInput: EngineInput & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(engineInput._id);

            delete engineInput._id;
            return { ...engineInput, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one EngineInput with New EngineInput object and corresponding EngineInput ID.
     * @param {object} EngineInputID - The id of the EngineInput to be updated
     * @param engineInputID
     * @param {EngineInputBase} entity - The new properties for the EngineInput
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(engineInputID, entity: EngineInputBase): Promise<number> {
        const { _id: id } = engineInputID;

        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: new ObjectId(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single EngineInput from the database by its EngineInputID
     * @param {string} EngineInputID - The id of the EngineInput to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the EngineInput was successfully deleted
     */
    async deleteOne(EngineInputID): Promise<boolean> {
        const { _id: id } = EngineInputID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new EngineInput in the database
     * @param {CreateEngineInputRequest} engineInput - The EngineInput information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created EngineInput
     */
    async create(engineInput: CreateEngineInputRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<EngineInputBase>(this.collectionName)
        ).insertOne({ ...engineInput, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all EngineInputs
     * @returns {Promise<number>} Number of deleted EngineInputs.
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

        await this.populateEngineInputsIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as EngineInputs, and it validates the documents against the JSON Schema before inserting.
     * The schema enforces the presence of fields name, description, and priority.
     */
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
                        required: ['request', 'Createddate'],
                        properties: {
                            name: {
                                bsonType: 'array',
                                description: 'Request is required field',
                            },
                            description: {
                                bsonType: 'Date',
                                description: 'Createddate is required field',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named sampleEngineInputs and the number of documents inserted is logged.
     */
    async populateEngineInputsIfUnavailable() {
        this.childLogger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const EngineInputCollection = await this.getCollection<EngineInputBase & MongoDbId>(
            this.collectionName
        );
        const EngineInputCount = (await EngineInputCollection.find().toArray()).length;
        if (EngineInputCount < 3) {
            const EngineInputWithObjectId = sampleEngineInputs.map((engineInput) => ({
                ...engineInput,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(engineInput._id),
            }));
            const { insertedCount } =
                await EngineInputCollection.insertMany(EngineInputWithObjectId);

            this.childLogger.info(
                `[${insertedCount}] documents were populated in the EngineInput collection`
            );
        }
    }
}