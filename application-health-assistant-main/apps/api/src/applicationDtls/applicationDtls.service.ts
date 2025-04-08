import { createLogger, format, transports } from 'winston';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { ApplicationComponent } from '@application-health-assistant/shared-api-model/constants/siem-logging';
import {
    CreateApplicationDtlRequest,
    UpdateApplicationDtlRequest,
    ApplicationDtl as ApplicationDtlDto,
} from '@application-health-assistant/shared-api-model/model/applicationDtls';

import { ApplicationDtlRepository } from './applicationDtls.repository';
import environment from '../environments/environment';

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
     * @param httpService
     * @param {ApplicationDtlRepository} applicationDtlRepository - An instance of the applicationDtlRepository class that is injected using the @Inject decorator.
     * This is used to interact with the task repository and perform CRUD operations. The string 'applicationDtlRepository' is the token that will be used to look up the dependency in the providers array.
     * @param http
     */
    constructor(
        private httpService: HttpService,
        @Inject('ApplicationDtlRepository')
        private applicationDtlRepository: ApplicationDtlRepository
    ) {}

    /**
     * Creates a new task based upon the provided create task request.
     * @param {CreateApplicationDtlRequest} createApplicationDtl The object representing the task to be created.
     * @returns {Promise<string>}  A promise containing a string representing the ID of the newly created task.
     */
    async create(createApplicationDtl: CreateApplicationDtlRequest): Promise<string> {
        try {
            const savedApplicationDtlID =
                await this.applicationDtlRepository.create(createApplicationDtl);

            this.logger.info(`[${savedApplicationDtlID}] ApplicationDtl was created`);

            const applicationDtlIDAsStr = String(savedApplicationDtlID);
            return applicationDtlIDAsStr;
        } catch (error) {
            this.logger.error(
                `There was an error creating ApplicationDtl: [${JSON.stringify(createApplicationDtl)}]`,
                {
                    error,
                }
            );
            throw new Error('Unable to save the ApplicationDtl to database');
        }
    }

    /**
     * Get Cast info from API.
     * @param {string} name Representing the value for search.
     * @returns {Promise<any>}  A promise containing app object with details from CAST.
     */
    async GetCastInfo(name: string): Promise<any> {
		console.log("In GetCASTInfo");
        const url = `${environment.apiToGetAppVul}${name}/insights/green-detection-patterns`;
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const { data } = await firstValueFrom(this.httpService.get(url));
        return data;
        // try {
        //     const url = `${environment.apiToGetAppVul}${name}/insights/green-detection-patterns`;
        //     console.log(url);
        //     const request = new Request(url, {
        //         method: 'GET',
        //     });
        //     const response = await fetch(request);
        //     console.log(response.body);
        //     if (!response.ok) {
        //         this.logger.error(
        //             `Failed to fetch CAST info for name: [${name}]. Status: [${response.status}]`
        //         );
        //         const errorData = await response.json();
        //         throw new Error(
        //             `Failed to fetch CAST info: ${response.statusText}. Details: ${JSON.stringify(errorData)}`
        //         );
        //     }

        //     const data = await response.json();
        //     this.logger.info(`Successfully fetched CAST info for name: [${name}]`);
        //     return data;
        // } catch (error) {
        //     this.logger.error(`There was an error fetching CAST info for name: [${name}]`, {
        //         error,
        //     });
        //     throw new Error(`Unable to fetch CAST info from the API: ${error.message}`);
        // }
    }

    /**
     * Get Cast info from API.
     * @param {string} id Representing the value for search.
     * @returns {Promise<any>}  A promise containing app object with details from CAST.
     */
    async CallAiEngine(id: string): Promise<any> {
        try {
            const url = `${environment.apiToGetAiRes}${id}`;
            // eslint-disable-next-line no-console
            console.log(url);
            const request = new Request(url, {
                method: 'GET',
            });
            const response = await fetch(request);

            // eslint-disable-next-line no-console
            console.log(response.body);
            if (!response.ok) {
                this.logger.error(
                    `Failed to fetch AI response for ID: [${id}]. Status: [${response.status}]`
                );
                throw new Error(`Failed to fetch AI response: ${response.statusText}`);
            }

            const data = await response.json();
            this.logger.info(`Successfully fetched AI response for ID: [${id}]`);
            return data;
        } catch (error) {
            this.logger.error(`There was an error fetching AI response for ID: [${id}]`, {
                error,
            });
            throw new Error('Unable to fetch AI response from the API');
        }
    }

    /**
     * Get Cast info from API.
     * @param {string} name Representing the value for search.
     * @param {string} issueId Representing the value of issue for which needs object
     * @returns {Promise<any>}  A promise containing app object with object details for issue from CAST.
     */
    async GetCastObjectInfo(name: string, issueId: string): Promise<any> {
        const url = `${environment.apiToGetAppVul}${name}/insights/green-detection-patterns/${issueId}/findings?limit=5000`;
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const { data } = await firstValueFrom(this.httpService.get(url));
        return data;
        // try {
        //     const url = `${environment.apiToGetAppVul}${name}/insights/green-detection-patterns/${issueId}/findings?limit=500`;
        //     const response = await fetch(url);
        //     if (!response.ok) {
        //         this.logger.error(
        //             `Failed to fetch CAST info for name: [${name}]. Status: [${response.status}]`
        //         );
        //         throw new Error(`Failed to fetch CAST info: ${response.statusText}`);
        //     }
        //     const data = await response.json();
        //     this.logger.info(`Successfully fetched CAST Object info for name: [${name}]`);
        //     return data;
        // } catch (error) {
        //     this.logger.error(`There was an error fetching CAST Object info for name: [${name}]`, {
        //         error,
        //     });
        //     throw new Error('Unable to fetch CAST info from the API');
        // }
    }

    /**
     * Retrieves all tasks.
     * @returns {Promise<ApplicationDtlDto[]>} A promise containing an array of all tasks.
     */
    async findAll(): Promise<ApplicationDtlDto[]> {
        let dataModelApplicationDtls;

        try {
            dataModelApplicationDtls = await this.applicationDtlRepository.findAll();
        } catch (err) {
            this.logger.error('There was an error finding all applicationDtls.', { error: err });

            throw err;
        }

        return dataModelApplicationDtls;
    }

    /**
     * Retrieves the task with the provided ID.
     * @param {string} id The ID of the task to find.
     * @returns {Promise<ApplicationDtlDto>} A promise containing the retrieved task.
     */
    async findOne(id: string): Promise<ApplicationDtlDto> {
        if (!id) {
            this.logger.error('Failed to find task. no id provided', {
                context: { id },
                applicationComponent: ApplicationComponent.APPLICATIONDTLS_SERVICE,
            });
            throw new BadRequestException(`Invalid ID of: [${id}] was provided.`);
        }

        let applicationDtl;
        try {
            applicationDtl = await this.applicationDtlRepository.findOne({ _id: id });
        } catch (error) {
            this.logger.error(`There was an error finding task with ID: [${id}].`, {
                error,
            });

            throw error;
        }

        if (!applicationDtl) {
            throw new NotFoundException(`No applicationDtl found for id [${id}]`);
        }

        return applicationDtl;
    }

    /**
     * Updates the task with the provided ID to match the provided update task.
     * @param {string} id The ID of the task to update.
     * @param {UpdateApplicationDtlRequest} updateApplicationDtl The updated version of the task.
     */
    async update(id: string, updateApplicationDtl: UpdateApplicationDtlRequest): Promise<void> {
        /*if (id !== updateApplicationDtl.id) {
			console.log("In update function");
            this.logger.error('Failed to update user. ID does not match the update applicationDtl', {
                context: { id, updateApplicationDtl },
                applicationComponent: ApplicationComponent.APPLICATIONDTLS_SERVICE,
            });
            throw new BadRequestException(
                `Provided task id [${id}] does not match id of submitted task object`
            );
        }*/

        // eslint-disable-next-line no-param-reassign
        delete updateApplicationDtl.id;

        let updateResult;
        try {
            updateResult = await this.applicationDtlRepository.updateOne(
                { _id: id },
                updateApplicationDtl
            );
        } catch (err) {
            this.logger.error(
                `There was an error updating applicationDtl: [${JSON.stringify(updateApplicationDtl)}].`,
                { error: err }
            );

            throw err;
        }

        if (updateResult === 0) {
            throw new NotFoundException(`No applicationDtl found for id [${id}]`);
        }
    }

    /**
     * Deletes the applicationDtl with the provided ID.
     * @param {string} id The ID of the applicationDtl to delete.
     */
    async remove(id: string): Promise<void> {
        let deleteResult;
        try {
            deleteResult = await this.applicationDtlRepository.deleteOne({ _id: id });
        } catch (err) {
            this.logger.error(`There was an error deleting applicationDtl with ID: [${id}].`, {
                error: err,
            });

            throw err;
        }

        if (!deleteResult) {
            throw new NotFoundException(`No applicationDtl found for id [${id}]`);
        }
    }

    /**
     * Deletes all tasks.
     * @returns {Promise<number>} A promise which contains the number of tasks deleted.
     */
    async removeAll(): Promise<number> {
        try {
            const deleteResult = await this.applicationDtlRepository.deleteAll();

            return deleteResult;
        } catch (err) {
            this.logger.error('There was an error deleting all applicationDtls.', { error: err });
            throw err;
        }
    }
}