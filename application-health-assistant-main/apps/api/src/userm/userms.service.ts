import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateUsermRequest,
    UpdateUsermRequest,
    Userm as UsermDto,
} from '@application-health-assistant/shared-api-model/model/userms';

import { UsermRepository } from './userms.repository';

/**
 * TasksService provides the business logic for the Tasks API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class UsermsService {
	private logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/userm-service.log' }),
        ],
    });
    /**
     * @param {Logger} logger - An instance of the Logger class.
     * @param {UsermRepository} UsermRepository - An instance of the feedbackRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'feedbackRepository' is the token that will be used to look up the dependency in the providers array.
     * @param usermRepository
     */
    constructor(
        @Inject('UsermRepository')
        private usermRepository: UsermRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateUsermRequest} createUserm The object representing the task to be created.
     * @param createUserm
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createUserm: CreateUsermRequest): Promise<string> {
        try {
            const savedFeedbackID = await this.usermRepository.create(createUserm);

            this.logger.info(`[${savedFeedbackID}] Feedback was created`);

            const feedbackIDAsStr = String(savedFeedbackID);
            return feedbackIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating Feedback: [${JSON.stringify(createUserm)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the Feedback to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<FeedbackDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<UsermDto[]> {
        let dataModelFeedbacks;

        try {
            dataModelFeedbacks = await this.usermRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all users.', {
                error: err,
            });

            throw err;
        }

        return dataModelFeedbacks;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<UsermDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<UsermDto> {
        if (!id) {
            this.logger.warn('Failed to find user. no userName provided', {
                context: { id },
                applicationComponent: ApplicationComponent.PULLREQUESTLOGS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let user;
        try {
            user = await this.usermRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding user with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!user) {
            throw new NotFoundException(`No user found for id [${id}]`);
        }

        return user;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdateFeedbackRequest} updateFeedback The updated version of the task.
     */
    async update(id: string, updateFeedback: UpdateUsermRequest): Promise<void> {
        if (id !== updateFeedback.id) {
            this.logger.warn('Failed to update user. ID does not match the update user', {
                context: { id, updateFeedback },
                applicationComponent: ApplicationComponent.RETENSIONOBJECTDETAILS_SERVICE,
            });
            throw new BadRequestException(
                `Provided retention id [${id}] does not match id of submitted task object`
            );
        }

        // eslint-disable-next-line no-param-reassign
        delete updateFeedback.id;

        let updateResult;
        try {
            updateResult = await this.usermRepository.updateOne({ _id: id }, updateFeedback);
        } catch (err) {
            this.logger.error(
                `There was an error updating user: [${JSON.stringify(updateFeedback)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No user found for id [${id}]`);
        }
    }

    /**
     * Deletes the feedback with the provided ID.
     * @param {string} id The ID of the feedback to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.usermRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting user with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No user found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.usermRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all users.', {
                error: err,
            });
            throw err;
        }
    }
}