import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreatePromptLibraryRequest,
    PromptLibraryBase,
} from '@application-health-assistant/shared-api-model/model/promptLibrarys';

import MongoRepository from '../../repository/mongo/mongo-repository';
import samplePromptLibrarys from '../initData';
import { PromptLibraryRepository } from '../promptLibrarys.repository';
import { PromptLibrary } from '../schemas/PromptLibrarys.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoPromptLibraryRepository
    extends MongoRepository
    implements PromptLibraryRepository
{
    PromptLibraryCollection: Collection;

    collectionName = 'PromptLibrary';

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
            new transports.File({ filename: 'mongo-prompt-library-repository.log' }),
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
     * Retrieves a single PromptLibrary by its ID
     * @param {object} PromptLibraryID - The id of the PromptLibrary to be found
     * @returns {Promise<PromptLibrary>} - A promise that resolves to a PromptLibrary object
     */
    async findOne(PromptLibraryID): Promise<PromptLibrary> {
        const { _id: id } = PromptLibraryID;
        const promptLibrary = await (
            await this.getCollection<PromptLibrary>(this.collectionName)
        ).findOne({
            _id: new ObjectId(id),
        });

        return promptLibrary;
    }

    /**
     * Retrieves all PromptLibrarys
     * @returns {Promise<PromptLibrary[]>} - A promise that resolves to an array of PromptLibrary objects
     */
    async findAll(): Promise<PromptLibrary[]> {
        const promptLibrarys = (await (await this.getCollection<PromptLibrary>(this.collectionName))
            .find()
            .toArray()) as PromptLibrary[];

        return promptLibrarys.map((promptLibrary: PromptLibrary & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(promptLibrary._id);

            delete promptLibrary._id;
            return { ...promptLibrary, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one PromptLibrary with New PromptLibrary object and corresponding PromptLibrary ID.
     * @param {object} PromptLibraryID - The id of the PromptLibrary to be updated
     * @param promptLibraryID
     * @param {PromptLibraryBase} entity - The new properties for the PromptLibrary
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(promptLibraryID, entity: PromptLibraryBase): Promise<number> {
        const { _id: id } = promptLibraryID;

        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: new ObjectId(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single PromptLibrary from the database by its PromptLibraryID
     * @param {string} PromptLibraryID - The id of the PromptLibrary to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the PromptLibrary was successfully deleted
     */
    async deleteOne(PromptLibraryID): Promise<boolean> {
        const { _id: id } = PromptLibraryID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new PromptLibrary in the database
     * @param {CreatePromptLibraryRequest} promptLibrary - The PromptLibrary information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created PromptLibrary
     */
    async create(promptLibrary: CreatePromptLibraryRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<PromptLibraryBase>(this.collectionName)
        ).insertOne({ ...promptLibrary, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all PromptLibrarys
     * @returns {Promise<number>} Number of deleted PromptLibrarys.
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

        await this.populatePromptLibrarysIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as PromptLibrarys, and it validates the documents against the JSON Schema before inserting.
     * The schema enforces the presence of fields name, description, and priority.
     */
    // eslint-disable-next-line max-lines-per-function
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
                        required: [
                            'applicationid',
                            'issueid',
                            'issuename',
                            'technologies',
                            'type',
                            'enabled',
                        ],
                        properties: {
                            applicationid: {
                                bsonType: 'string',
                                description: 'Application id is required field',
                            },
                            issueid: {
                                bsonType: 'numeric',
                                description: 'Issue id is required field',
                            },
                            issuename: {
                                bsonType: 'string',
                                description: 'Issue name is required field',
                            },
                            technologies: {
                                bsonType: 'array',
                                description: 'Prompt list is required field',
                            },
                            type: {
                                bsonType: 'string',
                                description: 'Type is required field',
                            },
                            enabled: {
                                bsonType: 'boolean',
                                description: 'Enabled field is required field',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named samplePromptLibrarys and the number of documents inserted is logged.
     */
    async populatePromptLibrarysIfUnavailable() {
        this.logger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const PromptLibraryCollection = await this.getCollection<PromptLibraryBase & MongoDbId>(
            this.collectionName
        );
        const PromptLibraryCount = (await PromptLibraryCollection.find().toArray()).length;
        if (PromptLibraryCount < 3) {
            const PromptLibraryWithObjectId = samplePromptLibrarys.map((promptLibrary) => ({
                ...promptLibrary,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(promptLibrary._id),
            }));
            const { insertedCount } =
                await PromptLibraryCollection.insertMany(PromptLibraryWithObjectId);

            this.logger.info(
                `[${insertedCount}] documents were populated in the PromptLibrary collection`
            );
        }
    }
}