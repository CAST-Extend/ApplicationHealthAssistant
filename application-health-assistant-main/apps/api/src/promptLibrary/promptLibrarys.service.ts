import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreatePromptLibraryRequest,
    UpdatePromptLibraryRequest,
    PromptLibrary as PromptLibraryDto,
} from '@application-health-assistant/shared-api-model/model/promptLibrarys';

import { PromptLibraryRepository } from './promptLibrarys.repository';

/**
 * PromptLibrarysService provides the business logic for the PromptLibrarys API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class PromptLibrarysService {
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
            new transports.File({ filename: 'logs/prompt-librarys-service.log' }),
        ],
    });

    /**
     * @param {PromptLibraryRepository} promptLibraryRepository - An instance of the promptLibraryRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'promptLibraryRepository' is the token that will be used to look up the dependency in the providers array.
     */
    constructor(
        @Inject('PromptLibraryRepository')
        private promptLibraryRepository: PromptLibraryRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreatePromptLibraryRequest} createPromptLibrary The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createPromptLibrary: CreatePromptLibraryRequest): Promise<string> {
        try {
            const savedPromptLibraryID =
                await this.promptLibraryRepository.create(createPromptLibrary);

            this.logger.info(`[${savedPromptLibraryID}] PromptLibrary was created`);

            const promptLibraryIDAsStr = String(savedPromptLibraryID);
            return promptLibraryIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating PromptLibrary: [${JSON.stringify(createPromptLibrary)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the PromptLibrary to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<PromptLibraryDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<PromptLibraryDto[]> {
        let dataModelPromptLibrarys;

        try {
            dataModelPromptLibrarys = await this.promptLibraryRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all promptLibrarys.', { error: err });

            throw err;
        }

        return dataModelPromptLibrarys;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<PromptLibraryDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<PromptLibraryDto> {
        if (!id) {
            this.logger.warn('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.PROMPTLIBRARYS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let promptLibrary;
        try {
            promptLibrary = await this.promptLibraryRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!promptLibrary) {
            throw new NotFoundException(`No promptLibrary found for id [${id}]`);
        }

        return promptLibrary;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdatePromptLibraryRequest} updatePromptLibrary The updated version of the task.
     */
    async update(id: string, updatePromptLibrary: UpdatePromptLibraryRequest): Promise<void> {
        if (id !== updatePromptLibrary.id) {
            this.logger.warn('Failed to update user. ID does not match the update promptLibrary', {
                context: { id, updatePromptLibrary },
                applicationComponent: ApplicationComponent.PROMPTLIBRARYS_SERVICE,
            });
            throw new BadRequestException(
                `Provided task id [${id}] does not match id of submitted task object`
            );
        }

        // eslint-disable-next-line no-param-reassign
        delete updatePromptLibrary.id;

        let updateResult;
        try {
            updateResult = await this.promptLibraryRepository.updateOne(
                { _id: id },
                updatePromptLibrary
            );
        } catch (err) {
            this.logger.error(
                `There was an error updating promptLibrary: [${JSON.stringify(updatePromptLibrary)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No promptLibrary found for id [${id}]`);
        }
    }

    /**
     * Deletes the promptLibrary with the provided ID.
     * @param {string} id The ID of the promptLibrary to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.promptLibraryRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting promptLibrary with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No promptLibrary found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.promptLibraryRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all promptLibrarys.', { error: err });
            throw err;
        }
    }
}