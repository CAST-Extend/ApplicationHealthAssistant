import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseInterceptors,
    ClassSerializerInterceptor,
    HttpCode,
    Res,
    Req,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
    CreatePullRequestLogRequest,
    DeletePullRequestLogsResponse,
    GetPullRequestLogsResponse,
    PullRequestLog,
    UpdatePullRequestLogRequest,
} from '@application-health-assistant/shared-api-model/model/pullRequestLogs';

import PullRequestLogsService from './pullRequestLogs.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The PullRequestLogsControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The PullRequestLogsController maps HTTP requests to the PullRequestLogsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/pullRequestLogs')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class PullRequestLogsController {
    /**
     * @param {PullRequestLogsService} pullRequestLogsService - instance of PullRequestLogservice.
     */
    constructor(private readonly pullRequestLogsService: PullRequestLogsService) {}

    /**
     * Creates a new PullRequestLog. The "Location" response header will be set to include the
     * ID of the newly created PullRequestLog.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreatePullRequestLogRequest} createPullRequestLogDto The  values for a new PullRequestLog as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createPullRequestLogDto: CreatePullRequestLogRequest
    ): Promise<void> {
        const createdPullRequestLogId =
            await this.pullRequestLogsService.create(createPullRequestLogDto);
        response.location(`${request.url}/${createdPullRequestLogId}`);
        response.send();
    }

    /**
     * Returns all the PullRequestLogs for the user. This allows the user to browse all PullRequestLogs in a UI.
     * @returns {Promise<GetPullRequestLogsResponse>} Response object contains an array of PullRequestLogs.
     */
    @Get()
    async findAll(): Promise<GetPullRequestLogsResponse> {
        const pullRequestLogs = await this.pullRequestLogsService.findAll();
        const result = {
            pullRequestLogs,
        };

        return result;
    }

    /**
     * Returns the specific details of a PullRequestLog for the user.
     * @param {string} id - A ID for the PullRequestLog.
     * @returns {Promise<PullRequestLog>} The details of the identified PullRequestLog.
     * @throws NotFoundException if the PullRequestLog ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PullRequestLog> {
        const pullRequestLog = await this.pullRequestLogsService.findOne(id);

        return {
            ...pullRequestLog,
        };
    }

    /**
     * Updates a specific PullRequestLog. The ID within the PullRequestLog must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the PullRequestLog ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the PullRequestLog to update
     * @param {UpdatePullRequestLogRequest} updatePullRequestLogDto - PullRequestLog with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updatePullRequestLogDto: UpdatePullRequestLogRequest
    ): Promise<void> {
        await this.pullRequestLogsService.update(id, updatePullRequestLogDto);
    }

    /**
     * Deletes a specific PullRequestLog.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific PullRequestLog that has to be deleted.
     * @throws NotFoundException if the PullRequestLog ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.pullRequestLogsService.remove(id);
    }

    /**
     * Deletes all the PullRequestLog for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeletePullRequestLogsResponse> {
        const numPullRequestLogsDeleted = await this.pullRequestLogsService.removeAll();
        return {
            numPullRequestLogsDeleted,
        };
    }
}
