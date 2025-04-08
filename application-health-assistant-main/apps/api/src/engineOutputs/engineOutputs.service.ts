import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateEngineOutputRequest,
    UpdateEngineOutputRequest,
    EngineOutput as EngineOutputDto,
} from '@application-health-assistant/shared-api-model/model/engineOutputs';

import { EngineOutputRepository } from './engineOutputs.repository';

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
     * @param {EngineOutputRepository} engineOutputRepository - An instance of the engineOutputRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'engineOutputRepository' is the token that will be used to look up the dependency in the providers array.
     */
    constructor(
        @Inject('EngineOutputRepository')
        private engineOutputRepository: EngineOutputRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateEngineOutputRequest} createEngineOutput The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createEngineOutput: CreateEngineOutputRequest): Promise<string> {
        try {
            const savedEngineOutputID =
                await this.engineOutputRepository.create(createEngineOutput);

            this.logger.info(`[${savedEngineOutputID}] EngineOutput was created`);

            const engineOutputIDAsStr = String(savedEngineOutputID);
            return engineOutputIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating EngineOutput: [${JSON.stringify(createEngineOutput)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the EngineOutput to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<EngineOutputDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<EngineOutputDto[]> {
        let dataModelEngineOutputs;

        try {
            dataModelEngineOutputs = await this.engineOutputRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all engineOutputs.', { error: err });

            throw err;
        }

        return dataModelEngineOutputs;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<EngineOutputDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<EngineOutputDto> {
        if (!id) {
            this.logger.warn('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.ENGINEOUTPUTS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let engineOutput;
        try {
            engineOutput = await this.engineOutputRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!engineOutput) {
            throw new NotFoundException(`No engineOutput found for id [${id}]`);
        }

        return engineOutput;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdateEngineOutputRequest} updateEngineOutput The updated version of the task.
     */
    async update(id: string, updateEngineOutput: UpdateEngineOutputRequest): Promise<void> {
        if (id !== updateEngineOutput.id) {
            this.logger.warn('Failed to update user. ID does not match the update engineOutput', {
                context: { id, updateEngineOutput },
                applicationComponent: ApplicationComponent.ENGINEOUTPUTS_SERVICE,
            });
            throw new BadRequestException(
                `Provided task id [${id}] does not match id of submitted task object`
            );
        }

        // eslint-disable-next-line no-param-reassign
        delete updateEngineOutput.id;

        let updateResult;
        try {
            updateResult = await this.engineOutputRepository.updateOne(
                { _id: id },
                updateEngineOutput
            );
        } catch (err) {
            this.logger.error(
                `There was an error updating engineOutput: [${JSON.stringify(updateEngineOutput)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No engineOutput found for id [${id}]`);
        }
    }

    /**
     * Deletes the engineOutput with the provided ID.
     * @param {string} id The ID of the engineOutput to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.engineOutputRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting engineOutput with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No engineOutput found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.engineOutputRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all engineOutputs.', { error: err });
            throw err;
        }
    }
}