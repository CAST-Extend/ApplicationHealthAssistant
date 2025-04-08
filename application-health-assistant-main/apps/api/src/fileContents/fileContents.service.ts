import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateFileContentRequest,
    UpdateFileContentRequest,
    FileContent as FileContentDto,
} from '@application-health-assistant/shared-api-model/model/fileContents';

import { FileContentRepository } from './fileContents.repository';

/**
 * TasksService provides the business logic for the Tasks API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class TasksService {
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
            new transports.File({ filename: 'logs/tasks-service.log' }),
        ],
    });

    /**
     * @param {FileContentRepository} fileContentRepository - An instance of the fileContentRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'fileContentRepository' is the token that will be used to look up the dependency in the providers array.
     */
    constructor(
        @Inject('FileContentRepository')
        private fileContentRepository: FileContentRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateFileContentRequest} createFileContent The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createFileContent: CreateFileContentRequest): Promise<string> {
        try {
            const savedFileContentID = await this.fileContentRepository.create(createFileContent);

            this.logger.info(`[${savedFileContentID}] FileContent was created`);

            const fileContentIDAsStr = String(savedFileContentID);
            return fileContentIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating FileContent: [${JSON.stringify(createFileContent)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the FileContent to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<FileContentDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<FileContentDto[]> {
        let dataModelFileContents;

        try {
            dataModelFileContents = await this.fileContentRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all fileContents.', { error: err });

            throw err;
        }

        return dataModelFileContents;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<FileContentDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<FileContentDto> {
        if (!id) {
            this.logger.warn('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.FILECONTENTS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let fileContent;
        try {
            fileContent = await this.fileContentRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!fileContent) {
            throw new NotFoundException(`No fileContent found for id [${id}]`);
        }

        return fileContent;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdateFileContentRequest} updateFileContent The updated version of the task.
     */
    async update(id: string, updateFileContent: UpdateFileContentRequest): Promise<void> {
        if (id !== updateFileContent.id) {
            this.logger.warn('Failed to update user. ID does not match the update fileContent', {
                context: { id, updateFileContent },
                applicationComponent: ApplicationComponent.FILECONTENTS_SERVICE,
            });
            throw new BadRequestException(
                `Provided task id [${id}] does not match id of submitted task object`
            );
        }

        // eslint-disable-next-line no-param-reassign
        delete updateFileContent.id;

        let updateResult;
        try {
            updateResult = await this.fileContentRepository.updateOne(
                { _id: id },
                updateFileContent
            );
        } catch (err) {
            this.logger.error(
                `There was an error updating fileContent: [${JSON.stringify(updateFileContent)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No fileContent found for id [${id}]`);
        }
    }

    /**
     * Deletes the fileContent with the provided ID.
     * @param {string} id The ID of the fileContent to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.fileContentRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting fileContent with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No fileContent found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.fileContentRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all fileContents.', { error: err });
            throw err;
        }
    }
}