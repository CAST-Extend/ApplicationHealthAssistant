import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateFeedbackRequest,
    UpdateFeedbackRequest,
    Feedback as FeedbackDto,
} from '@application-health-assistant/shared-api-model/model/feedbacks';

import { FeedbackRepository } from './feedbacks.repository';
import EmailService from '../app/common/EmailService';

/**
 * TasksService provides the business logic for the Tasks API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class FeedbacksService {
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
            new transports.File({ filename: 'logs/feedbacks-service.log' }),
        ],
    });

    /**
     * @param {FeedbackRepository} feedbackRepository - An instance of the feedbackRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'feedbackRepository' is the token that will be used to look up the dependency in the providers array.
     * @param emailService
     */
    constructor(
        @Inject('FeedbackRepository')
        private feedbackRepository: FeedbackRepository,
        private emailService: EmailService
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateFeedbackRequest} createFeedback The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createFeedback: CreateFeedbackRequest): Promise<string> {
        try {
            const savedFeedbackID = await this.feedbackRepository.create(createFeedback);

            this.logger.info(`[${savedFeedbackID}] Feedback was created`);
            const subject = `New feedback recieved from ${createFeedback.username}`;
            const message = `Feedback Details:\n${createFeedback.feedback_description}\n\n Regards,\n${localStorage.getItem('currentUser')}`;
            await this.emailService.sendEmail(subject, message);
            const feedbackIDAsStr = String(savedFeedbackID);
            return feedbackIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating Feedback: [${JSON.stringify(createFeedback)}]`,
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
    async findAll(): Promise<FeedbackDto[]> {
        let dataModelFeedbacks;

        try {
            dataModelFeedbacks = await this.feedbackRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all feedbacks.', {
                error: err,
            });

            throw err;
        }

        return dataModelFeedbacks;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<FeedbackDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<FeedbackDto> {
        if (!id) {
            this.logger.warn('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.PULLREQUESTLOGS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let feedback;
        try {
            feedback = await this.feedbackRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!feedback) {
            throw new NotFoundException(`No feedback found for id [${id}]`);
        }

        return feedback;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdateFeedbackRequest} updateFeedback The updated version of the task.
     */
    async update(id: string, updateFeedback: UpdateFeedbackRequest): Promise<void> {
        if (id !== updateFeedback.id) {
            this.logger.warn('Failed to update user. ID does not match the update feedback', {
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
            updateResult = await this.feedbackRepository.updateOne({ _id: id }, updateFeedback);
        } catch (err) {
            this.logger.error(
                `There was an error updating feedback: [${JSON.stringify(updateFeedback)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No feedback found for id [${id}]`);
        }
    }

    /**
     * Deletes the feedback with the provided ID.
     * @param {string} id The ID of the feedback to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.feedbackRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting feedback with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No feedback found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.feedbackRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all feedbacks.', {
                error: err,
            });
            throw err;
        }
    }
}