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
    CreateIssueDetailRequest,
    DeleteIssueDetailsResponse,
    GetIssueDetailsResponse,
    IssueDetail,
    UpdateIssueDetailRequest,
} from '@application-health-assistant/shared-api-model/model/issueDetails';

import IssueDetailsService from './issueDetails.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The IssueDetailsControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The IssueDetailsController maps HTTP requests to the IssueDetailsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/issueDetails')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class IssueDetailsController {
    /**
     * @param {IssueDetailsService} issueDetailsService - instance of IssueDetailservice.
     */
    constructor(private readonly issueDetailsService: IssueDetailsService) {}

    /**
     * Creates a new IssueDetail. The "Location" response header will be set to include the
     * ID of the newly created IssueDetail.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateIssueDetailRequest} createIssueDetailDto The  values for a new IssueDetail as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createIssueDetailDto: CreateIssueDetailRequest
    ): Promise<void> {
        const createdIssueDetailId = await this.issueDetailsService.create(createIssueDetailDto);
        response.location(`${request.url}/${createdIssueDetailId}`);
        response.send();
    }

    /**
     * Returns all the IssueDetails for the user. This allows the user to browse all IssueDetails in a UI.
     * @returns {Promise<GetIssueDetailsResponse>} Response object contains an array of IssueDetails.
     */
    @Get()
    async findAll(): Promise<GetIssueDetailsResponse> {
        console.log('testall');
        const issueDetails = await this.issueDetailsService.findAll();
        const result = {
            issueDetails,
        };

        return result;
    }

    /**
     * Returns the specific details of a IssueDetail for the user.
     * @param {string} id - A ID for the IssueDetail.
     * @returns {Promise<IssueDetail>} The details of the identified IssueDetail.
     * @throws NotFoundException if the IssueDetail ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IssueDetail> {
        const issueDetail = await this.issueDetailsService.findOne(id);

        return {
            ...issueDetail,
        };
    }

    /**
     *
     * @param id
     */
    @Get(':id')
    async findbyappid(@Param('id') id: string): Promise<IssueDetail> {
        const issueDetail = await this.issueDetailsService.findbyapplicationid(id);
        return {
            ...issueDetail,
        };
    }
    /**
     * Updates a specific IssueDetail. The ID within the IssueDetail must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the IssueDetail ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the IssueDetail to update
     * @param {UpdateIssueDetailRequest} updateIssueDetailDto - IssueDetail with new object properties.
     */

    /**
     *
     * @param id
     * @param updateIssueDetailDto
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateIssueDetailDto: UpdateIssueDetailRequest
    ): Promise<void> {
        await this.issueDetailsService.update(id, updateIssueDetailDto);
    }

    /**
     * Deletes a specific IssueDetail.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific IssueDetail that has to be deleted.
     * @throws NotFoundException if the IssueDetail ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.issueDetailsService.remove(id);
    }

    /**
     * Deletes all the IssueDetails for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteIssueDetailsResponse> {
        const numIssueDetailsDeleted = await this.issueDetailsService.removeAll();
        return {
            numIssueDetailsDeleted,
        };
    }
}
