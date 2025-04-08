import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreateApplicationDtlRequest,
    ApplicationDtlBase,
} from '@application-health-assistant/shared-api-model/model/applicationDtls';

import MongoRepository from '../../repository/mongo/mongo-repository';
import { ApplicationDtlRepository } from '../applicationDtls.repository';
import sampleApplicationDtls from '../initData';
import { ApplicationDtl } from '../schemas/ApplicationDtls.schema';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoApplicationDtlRepository
    extends MongoRepository
    implements ApplicationDtlRepository
{
    ApplicationDtlCollection: Collection;

    collectionName = 'ApplicationDetails';

    private readonly childLogger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/mongo-application-dtl.log' })
        ],
    });

    /**
     * @param {ConfigService} configService - A service class that provides access to application configuration values to read from secrets and environmental variables.
     * @param {childLogger} childLogger - A class that provides logging functionality to stdout.
     */
    constructor(
        configService: ConfigService
    ) {
        super(configService);
    }

    /**
     * Retrieves a single IssueDetail by its ID
     * @param {object} ApplicationDtlID - The id of the IssueDetail to be found
     * @returns {Promise<ApplicationDtl>} - A promise that resolves to a IssueDetail object
     */
    async findOne(ApplicationDtlID): Promise<ApplicationDtl> {
        const { _id: id } = ApplicationDtlID;
        const applicationDtl = await (
            await this.getCollection<ApplicationDtl>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    id: '$_id',
                    SSP_AppName: 1,
                    CAST_AppName: 1,
                    SSP_AppID: 1,
                    CastKey: 1,
                    branchName: 1,
                    ProductCode: 1,
                    Repository: 1,
                    lastScanDate: 1,
                },
            }
        );

        return applicationDtl;
    }

    /**
     * Retrieves all ApplicationDtls
     * @returns {Promise<ApplicationDtl[]>} - A promise that resolves to an array of ApplicationDtl objects
     */
    async findAll(): Promise<ApplicationDtl[]> {
        const applicationDtls = (await (
            await this.getCollection<ApplicationDtl>(this.collectionName)
        )
            .find()
            .toArray()) as ApplicationDtl[];

        return applicationDtls.map((applicationDtl: ApplicationDtl & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(applicationDtl._id);

            delete applicationDtl._id;
            return { ...applicationDtl, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one IssueDetail with New IssueDetail object and corresponding IssueDetail ID.
     * @param {object} ApplicationDtlID - The id of the IssueDetail to be updated
     * @param {ApplicationDtlBase} entity - The new properties for the IssueDetail
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(ApplicationDtlID, entity: ApplicationDtlBase): Promise<number> {
        const { _id: id } = ApplicationDtlID;

        const resp = await (
            await this.getCollection(this.collectionName)
        ).findOneAndReplace({ _id: new ObjectId(id) }, entity);
        // eslint-disable-next-line no-underscore-dangle
        return resp._id ? 1 : 0;
    }

    /**
     * Deletes a single IssueDetail from the database by its IssueDetailID
     * @param {string} ApplicationDtlID - The id of the IssueDetail to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the IssueDetail was successfully deleted
     */
    async deleteOne(ApplicationDtlID): Promise<boolean> {
        const { _id: id } = ApplicationDtlID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new IssueDetail in the database
     * @param {CreateApplicationDtlRequest} applicationDtl - The IssueDetail information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created IssueDetail
     */
    async create(applicationDtl: CreateApplicationDtlRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<ApplicationDtlBase>(this.collectionName)
        ).insertOne({ ...applicationDtl, _id });
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

        await this.populateApplicationDtlsIfUnavailable();
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
            this.childLogger.info(
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
    async populateApplicationDtlsIfUnavailable() {
        this.childLogger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const ApplicationDtlCollection = await this.getCollection<ApplicationDtlBase & MongoDbId>(
            this.collectionName
        );
        const ApplicationDtlCount = (await ApplicationDtlCollection.find().toArray()).length;
        if (ApplicationDtlCount < 3) {
            const ApplicationDtlWithObjectId = sampleApplicationDtls.map((applicationDtl) => ({
                ...applicationDtl,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(applicationDtl._id),
            }));
            const { insertedCount } = await ApplicationDtlCollection.insertMany(
                ApplicationDtlWithObjectId
            );

            this.childLogger.info(
                `[${insertedCount}] documents were populated in the IssueDetail collection`
            );
        }
    }
}