import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreateFileContentRequest,
    FileContentBase,
} from '@application-health-assistant/shared-api-model/model/fileContents';

import MongoRepository from '../../repository/mongo/mongo-repository';
import { FileContentRepository } from '../fileContents.repository';
import sampleFileContents from '../initData';
import { FileContent } from '../schemas/FileContents.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoFileContentRepository
    extends MongoRepository
    implements FileContentRepository
{
    FileContentCollection: Collection;

    collectionName = 'FilesContent';

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
            new transports.File({ filename: 'logs/file-content.log' }),
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
     * Retrieves a single FileContent by its ID
     * @param {object} FileContentID - The id of the FileContent to be found
     * @returns {Promise<FileContent>} - A promise that resolves to a FileContent object
     */
    async findOne(FileContentID): Promise<FileContent> {
        const { _id: id } = FileContentID;
        const fileContent = await (
            await this.getCollection<FileContent>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    id: '$_id',
                    requestid: '1212334223',
                    updatedcontentinfo: [],
                    createddate: 'mmddyy HH:MM:SS',
                },
            }
        );

        return fileContent;
    }

    /**
     * Retrieves all FileContents
     * @returns {Promise<FileContent[]>} - A promise that resolves to an array of FileContent objects
     */
    async findAll(): Promise<FileContent[]> {
        const fileContents = (await (await this.getCollection<FileContent>(this.collectionName))
            .find()
            .toArray()) as FileContent[];

        return fileContents.map((fileContent: FileContent & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(fileContent._id);

            delete fileContent._id;
            return { ...fileContent, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one FileContent with New FileContent object and corresponding FileContent ID.
     * @param {object} FileContentID - The id of the FileContent to be updated
     * @param fileContentID
     * @param {FileContentBase} entity - The new properties for the FileContent
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(fileContentID, entity: FileContentBase): Promise<number> {
        const { _id: id } = fileContentID;

        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: ObjectId.createFromTime(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single FileContent from the database by its FileContentID
     * @param {string} FileContentID - The id of the FileContent to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the FileContent was successfully deleted
     */
    async deleteOne(FileContentID): Promise<boolean> {
        const { _id: id } = FileContentID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new FileContent in the database
     * @param {CreateFileContentRequest} fileContent - The FileContent information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created FileContent
     */
    async create(fileContent: CreateFileContentRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<FileContentBase>(this.collectionName)
        ).insertOne({ ...fileContent, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all FileContents
     * @returns {Promise<number>} Number of deleted FileContents.
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

        await this.populateFileContentsIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as FileContents, and it validates the documents against the JSON Schema before inserting.
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
                        required: ['requestid', 'updatedcontentinfo', 'createddate'],
                        properties: {
                            requestid: {
                                bsonType: 'string',
                                description: 'updatedcontentinfo is required field ',
                            },
                            updatedcontentinfo: {
                                bsonType: 'array',
                                description: 'updatedcontentinfo is required field ',
                            },
                            createddate: {
                                bsonType: 'date',
                                description: 'date is required field',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named sampleFileContents and the number of documents inserted is logged.
     */
    async populateFileContentsIfUnavailable() {
        this.childLogger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const FileContentCollection = await this.getCollection<FileContentBase & MongoDbId>(
            this.collectionName
        );
        const FileContentCount = (await FileContentCollection.find().toArray()).length;
        if (FileContentCount < 3) {
            const FileContentWithObjectId = sampleFileContents.map((fileContent) => ({
                ...fileContent,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(fileContent._id),
            }));
            const { insertedCount } =
                await FileContentCollection.insertMany(FileContentWithObjectId);

            this.childLogger.info(
                `[${insertedCount}] documents were populated in the FileContent collection`
            );
        }
    }
}