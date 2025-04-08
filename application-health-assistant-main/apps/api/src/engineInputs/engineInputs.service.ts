import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateEngineInputRequest,
    UpdateEngineInputRequest,
    EngineInput as EngineInputDto,
} from '@application-health-assistant/shared-api-model/model/engineInputs';

import { EngineInputRepository } from './engineInputs.repository';

/**
 * TasksService provides the business logic for the Tasks API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class TasksService {
    private readonly logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'logs/tasks.log' })
        ],
    });

    /**
     * @param {EngineInputRepository} engineInputRepository - An instance of the engineInputRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'engineInputRepository' is the token that will be used to look up the dependency in the providers array.
     */
    constructor(
        @Inject('EngineInputRepository')
        private engineInputRepository: EngineInputRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateEngineInputRequest} createEngineInput The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createEngineInput: CreateEngineInputRequest): Promise<string> {
        try {
            const savedEngineInputID = await this.engineInputRepository.create(createEngineInput);

            this.logger.info(`[${savedEngineInputID}] EngineInput was created`);

            const engineInputIDAsStr = String(savedEngineInputID);
            return engineInputIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating EngineInput: [${JSON.stringify(createEngineInput)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the EngineInput to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<EngineInputDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<EngineInputDto[]> {
        let dataModelEngineInputs;

        try {
            dataModelEngineInputs = await this.engineInputRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all engineInputs.', { error: err });

            throw err;
        }

        return dataModelEngineInputs;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<EngineInputDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<EngineInputDto> {
        if (!id) {
            this.logger.error('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.ENGINEINPUTS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let engineInput;
        try {
            engineInput = await this.engineInputRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!engineInput) {
            throw new NotFoundException(`No engineInput found for id [${id}]`);
        }

        return engineInput;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdateEngineInputRequest} updateEngineInput The updated version of the task.
     */
    async update(id: string, updateEngineInput: UpdateEngineInputRequest): Promise<void> {
        if (id !== updateEngineInput.id) {
            this.logger.error('Failed to update user. ID does not match the update engineInput', {
                context: { id, updateEngineInput },
                applicationComponent: ApplicationComponent.ENGINEINPUTS_SERVICE,
            });
            throw new BadRequestException(
                `Provided task id [${id}] does not match id of submitted task object`
            );
        }

        // delete updateEngineInput.id;

        let updateResult;
        try {
            updateResult = await this.engineInputRepository.updateOne(
                { _id: id },
                updateEngineInput
            );
        } catch (err) {
            this.logger.error(
                `There was an error updating engineInput: [${JSON.stringify(updateEngineInput)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No engineInput found for id [${id}]`);
        }
    }

    /**
     * Deletes the engineInput with the provided ID.
     * @param {string} id The ID of the engineInput to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.engineInputRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting engineInput with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No engineInput found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.engineInputRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all engineInputs.', { error: err });
            throw err;
        }
    }
}