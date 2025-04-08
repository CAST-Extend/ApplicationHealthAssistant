import { createLogger, format, transports } from 'winston';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateRetensionObjectDetailRequest,
    UpdateRetensionObjectDetailRequest,
    RetensionObjectDetail as RetensionObjectDetailDto,
} from '@application-health-assistant/shared-api-model/model/retensionObjectDetails';

import { RetensionObjectDetailRepository } from './retensionObjectDetails.repository';

const logger = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
});

/**
 * TasksService provides the business logic for the Tasks API
 * and persists any data to a Mongo datastore.
 */
@Injectable()
export default class TasksService {
    /**
     * @param {Logger} logger - An instance of the Logger class.
     * @param {RetensionObjectDetailRepository} retensionObjectDetailRepository - An instance of the retensionObjectDetailRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'retensionObjectDetailRepository' is the token that will be used to look up the dependency in the providers array.
     */
    constructor(
        @Inject('RetensionObjectDetailRepository')
        private retensionObjectDetailRepository: RetensionObjectDetailRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateRetensionObjectDetailRequest} createRetensionObjectDetail The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createRetensionObjectDetail: CreateRetensionObjectDetailRequest): Promise<string> {
        try {
            const savedRetensionObjectDetailID = await this.retensionObjectDetailRepository.create(
                createRetensionObjectDetail
            );

            logger.info(`[${savedRetensionObjectDetailID}] RetensionObjectDetail was created`);

            const retensionObjectDetailIDAsStr = String(savedRetensionObjectDetailID);
            return retensionObjectDetailIDAsStr;
        } catch (error) {
            logger.error(`Error creating RetensionObjectDetail: ${JSON.stringify(createRetensionObjectDetail)}`, { error });
            throw new Error('Unable to save the RetensionObjectDetail to database');
        }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<RetensionObjectDetailDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<RetensionObjectDetailDto[]> {
        let dataModelRetensionObjectDetails;

        try {
            dataModelRetensionObjectDetails = await this.retensionObjectDetailRepository.findAll();
        } catch (err) {
            logger.error('Error finding all retensionObjectDetails.', { error: err });
            throw err;
        }

        return dataModelRetensionObjectDetails;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<RetensionObjectDetailDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<RetensionObjectDetailDto> {
        if (!id) {
            logger.warn('Failed to find task. No ID provided.', { id });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let retensionObjectDetail;
        try {
            const retensionObjectDetail = await this.retensionObjectDetailRepository.findOne({ _id: id });
            if (!retensionObjectDetail) {
                throw new NotFoundException(`No retensionObjectDetail found for id [${id}]`);
            }
            return retensionObjectDetail;
        } catch (error) {
            logger.error(`Error finding task with ID: [${id}].`, { error });
            throw error;
        }
    }

    async update(
        id: string,
        updateRetensionObjectDetail: UpdateRetensionObjectDetailRequest
    ): Promise<void> {
        if (id !== updateRetensionObjectDetail.id) {
            logger.warn('Failed to update user. ID does not match.', { id, updateRetensionObjectDetail });
            throw new BadRequestException(
                `Provided retention id [${id}] does not match id of submitted task object`
            );
        }

        // eslint-disable-next-line no-param-reassign
        delete updateRetensionObjectDetail.id;

        let updateResult;
        try {
            updateResult = await this.retensionObjectDetailRepository.updateOne(
                { _id: id },
                updateRetensionObjectDetail
            );
        } catch (err) {
            logger.error(
                `Error updating retensionObjectDetail: ${JSON.stringify(updateRetensionObjectDetail)}.`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No retensionObjectDetail found for id [${id}]`);
        }
    }

    /**
     * Deletes the retensionObjectDetail with the provided ID.
     * @param {string} id The ID of the retensionObjectDetail to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.retensionObjectDetailRepository.deleteOne({ _id: id });
        } catch (err) {
            logger.error(`Error deleting retensionObjectDetail with ID: [${id}].`, { error: err });
            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No retensionObjectDetail found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.retensionObjectDetailRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            logger.error('Error deleting all retensionObjectDetails.', { error: err });
            throw err;
        }
    }
}