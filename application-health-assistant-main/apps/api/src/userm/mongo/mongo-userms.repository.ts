import { createLogger, format, transports } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';

import {
    CreateUsermRequest,
    UsermBase,
} from '@application-health-assistant/shared-api-model/model/userms';

import MongoRepository from '../../repository/mongo/mongo-repository';
import sampleUserms from '../initData';
import { Userm } from '../schemas/Userms.schema';
import { UsermRepository } from '../userms.repository';

type MongoDbId = Record<'_id', ObjectId | string>;

@Injectable()
export default class MongoUsermRepository extends MongoRepository implements UsermRepository {
    UsermCollection: Collection;

    collectionName = 'UserManagement';

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
     * Retrieves a single user by its ID
     * @param {object} UsermID - The id of the Feedback to be found
     * @param UsermID._id
     * @returns {Promise<userm>} - A promise that resolves to a Feedback object
     */
    async findOne(UsermID: { _id: any }): Promise<Userm> {
        const { _id: id } = UsermID;
        const userm = await (
            await this.getCollection<Userm>(this.collectionName)
        ).findOne(
            {
                _id: new ObjectId(id),
            },
            {
                projection: {
                    _id: 0,
                    id: '$_id',
                    createdDate: '2024-10-17T12:00:09.964Z',
                    userType: 'admin',
                    userName: 'xxx.xx@mmc.com',
                },
            }
        );

        return userm;
    }

    /**
     * Retrieves all Feedbacks
     * @returns {Promise<Userm[]>} - A promise that resolves to an array of Feedback objects
     */
    async findAll(): Promise<Userm[]> {
        const userms = (await (await this.getCollection<Userm>(this.collectionName))
            .find()
            .toArray()) as Userm[];
        console.log(userms);
        return userms.map((userm: Userm & MongoDbId) => {
            /* eslint-disable no-underscore-dangle, no-param-reassign */
            const id = String(userm._id);

            delete userm._id;
            return { ...userm, id };
            /* eslint-enable no-underscore-dangle, no-param-reassign */
        });
    }

    /**
     * Update one Feedback with New Feedback object and corresponding Feedback ID.
     * @param {object} FeedbackID - The id of the Feedback to be updated
     * @param feedbackID
     * @param {UsermBase} entity - The new properties for the Feedback
     * @returns {Promise<number>} - A promise that responds with number of updated entities.
     */
    async updateOne(feedbackID, entity: UsermBase): Promise<number> {
        const { _id: id } = feedbackID;
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
     * Deletes a single Feedback from the database by its FeedbackID
     * @param {string} FeedbackID - The id of the Feedback to be deleted
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the Feedback was successfully deleted
     */
    async deleteOne(FeedbackID): Promise<boolean> {
        const { _id: id } = FeedbackID;
        const resp = await (
            await this.getCollection(this.collectionName)
        ).deleteOne({
            _id: new ObjectId(id),
        });
        return Boolean(resp.deletedCount);
    }

    /**
     * Creates a new Feedback in the database
     * @param {CreateFeedbackRequest} feedback - The Feedback information to create
     * @returns {Promise<object>} - Returns a promise that resolves to the ID of the created Feedback
     */
    async create(feedback: CreateUsermRequest): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
        const _id = new ObjectId();
        const resp = await (
            await this.getCollection<UsermBase>(this.collectionName)
        ).insertOne({ ...feedback, _id });
        return resp.insertedId;
    }

    /**
     * Deletes all Feedbacks
     * @returns {Promise<number>} Number of deleted Feedbacks.
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

        await this.populateFeedbacksIfUnavailable();
    }

    /**
     * This function creates a new collection if it doesn't exist in the MongoDB instance.
     * The collection is named as Feedbacks, and it validates the documents against the JSON Schema before inserting.
     * The schema enforces the presence of fields name, description, and priority.
     */

    /**
     *
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
                        required: ['createdDate', 'userType', 'userName'],
                        properties: {
                            userName: {
                                bsonType: 'string',
                                description: 'userName is required field',
                            },
                            createdDate: {
                                bsonType: 'string',
                                description: 'createdDate is required field',
                            },

                            userType: {
                                bsonType: 'string',
                                description: 'userType is required field',
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * This function checks if there are any documents in the collection and if not, it populates the collection with sample data.
     * The sample data is stored in a constant named sampleFeedbacks and the number of documents inserted is logged.
     */
    async populateFeedbacksIfUnavailable() {
        this.logger.info(`Inserting metadata into collection [${this.collectionName}]`);
        const FeedbackCollection = await this.getCollection<UsermBase & MongoDbId>(
            this.collectionName
        );
        const FeedbackCount = (await FeedbackCollection.find().toArray()).length;
        if (FeedbackCount < 3) {
            const FeedbackWithObjectId = sampleUserms.map((feedback) => ({
                ...feedback,
                // eslint-disable-next-line no-underscore-dangle
                _id: new ObjectId(feedback._id),
            }));
            const { insertedCount } = await FeedbackCollection.insertMany(FeedbackWithObjectId);

            this.logger.info(
                `[${insertedCount}] documents were populated in the Feedback collection`
            );
        }
    }
}