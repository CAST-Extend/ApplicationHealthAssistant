import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreatePullRequestLogRequest,
    UpdatePullRequestLogRequest,
    PullRequestLog as PullRequestLogDto,
} from '@application-health-assistant/shared-api-model/model/pullRequestLogs';

import { PullRequestLogRepository } from './pullRequestLogs.repository';

// Create a winston logger instance
const logger = createLogger({
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
 * TasksService provides the business logic for the Tasks API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class PullRequestLogsService {
    /**
     * @param {PullRequestLogRepository} pullRequestLogRepository - An instance of the pullRequestLogRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'pullRequestLogRepository' is the token that will be used to look up the dependency in the providers array.
     */
    constructor(
        @Inject('PullRequestLogRepository')
        private pullRequestLogRepository: PullRequestLogRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreatePullRequestLogRequest} createPullRequestLog The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createPullRequestLog: CreatePullRequestLogRequest): Promise<string> {
        try {
            const savedPullRequestLogID =
                await this.pullRequestLogRepository.create(createPullRequestLog);

            logger.info(`[${savedPullRequestLogID}] PullRequestLog was created`);

            const pullRequestLogIDAsStr = String(savedPullRequestLogID);
            return pullRequestLogIDAsStr;
        } catch (error) {
            logger.error(
                `There was an error creating PullRequestLog: [${JSON.stringify(createPullRequestLog)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the PullRequestLog to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<PullRequestLogDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<PullRequestLogDto[]> {
        let dataModelPullRequestLogs;

        try {
            dataModelPullRequestLogs = await this.pullRequestLogRepository.findAll();
        } catch (err) {
            logger.error('There was an error finding all pullRequestLogs.', {
                error: err,
            });

            throw err;
        }

        return dataModelPullRequestLogs;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<PullRequestLogDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<PullRequestLogDto> {
        if (!id) {
            logger.error('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.PULLREQUESTLOGS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let pullRequestLog;
        try {
            pullRequestLog = await this.pullRequestLogRepository.findOne({ _id: id });
        } catch (error) {
            logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!pullRequestLog) {
            throw new NotFoundException(`No pullRequestLog found for id [${id}]`);
        }

        return pullRequestLog;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdatePullRequestLogRequest} updatePullRequestLog The updated version of the task.
     */
    async update(id: string, updatePullRequestLog: UpdatePullRequestLogRequest): Promise<void> {
        if (id !== updatePullRequestLog.id) {
            logger.error('Failed to update user. ID does not match the update pullRequestLog', {
                context: { id, updatePullRequestLog },
                applicationComponent: ApplicationComponent.RETENSIONOBJECTDETAILS_SERVICE,
            });
            throw new BadRequestException(
                `Provided retention id [${id}] does not match id of submitted task object`
            );
        }

        // eslint-disable-next-line no-param-reassign
        delete updatePullRequestLog.id;

        let updateResult;
        try {
            updateResult = await this.pullRequestLogRepository.updateOne(
                { _id: id },
                updatePullRequestLog
            );
        } catch (err) {
            logger.error(
                `There was an error updating pullRequestLog: [${JSON.stringify(updatePullRequestLog)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No pullRequestLog found for id [${id}]`);
        }
    }

    /**
     * Deletes the pullRequestLog with the provided ID.
     * @param {string} id The ID of the pullRequestLog to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.pullRequestLogRepository.deleteOne({ _id: id });
        } catch (err) {
            logger.error(`There was an error deleting pullRequestLog with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No pullRequestLog found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.pullRequestLogRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            logger.error('There was an error deleting all pullRequestLogs.', {
                error: err,
            });
            throw err;
        }
    }
}