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
    CreateRetensionObjectDetailRequest,
    DeleteRetensionObjectDetailsResponse,
    GetRetensionObjectDetailsResponse,
    RetensionObjectDetail,
    UpdateRetensionObjectDetailRequest,
} from '@application-health-assistant/shared-api-model/model/retensionObjectDetails';

import RetensionObjectDetailsService from './retensionObjectDetails.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The RetensionObjectDetailsControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The RetensionObjectDetailsController maps HTTP requests to the RetensionObjectDetailsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/retensionObjectDetails')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class RetensionObjectDetailsController {
    /**
     * @param {RetensionObjectDetailsService} retensionObjectDetailsService - instance of RetensionObjectDetailservice.
     */
    constructor(private readonly retensionObjectDetailsService: RetensionObjectDetailsService) {}

    /**
     * Creates a new RetensionObjectDetail. The "Location" response header will be set to include the
     * ID of the newly created RetensionObjectDetail.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateRetensionObjectDetailRequest} createRetensionObjectDetailDto The  values for a new RetensionObjectDetail as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createRetensionObjectDetailDto: CreateRetensionObjectDetailRequest
    ): Promise<void> {
        const reqresult = await this.finddatabasedonissueidwithapplicationid(
            createRetensionObjectDetailDto.issueId,
            createRetensionObjectDetailDto.applicationId
        );

        if (reqresult.retensionObjectDetails.length > 0) {
            const createdRetensionObjectDetailId =
                reqresult.retensionObjectDetails[0].retensionObjectId.push(
                    ...createRetensionObjectDetailDto.retensionObjectId
                );
            await this.update(
                reqresult.retensionObjectDetails[0].id,
                reqresult.retensionObjectDetails[0]
            );
            response.location(`${request.url}/${createdRetensionObjectDetailId}`);
            response.send();
        } else {
            const createdRetensionObjectDetailId = await this.retensionObjectDetailsService.create(
                createRetensionObjectDetailDto
            );
            response.location(`${request.url}/${createdRetensionObjectDetailId}`);
            response.send();
        }
    }

    /**
     * Returns all the RetensionObjectDetails for the user. This allows the user to browse all RetensionObjectDetails in a UI.
     * @returns {Promise<GetRetensionObjectDetailsResponse>} Response object contains an array of RetensionObjectDetails.
     */
    @Get()
    async findAll(): Promise<GetRetensionObjectDetailsResponse> {
        const retensionObjectDetails = await this.retensionObjectDetailsService.findAll();
        const result = {
            retensionObjectDetails,
        };

        return result;
    }

    /**
     * Returns the specific details of a RetensionObjectDetail for the user.
     * @param {string} id - A ID for the RetensionObjectDetail.
     * @returns {Promise<RetensionObjectDetail>} The details of the identified RetensionObjectDetail.
     * @throws NotFoundException if the RetensionObjectDetail ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<RetensionObjectDetail> {
        const retensionObjectDetail = await this.retensionObjectDetailsService.findOne(id);

        return {
            ...retensionObjectDetail,
        };
    }

    /**
     * Returns the specific details of a RetensionObjectDetail for the user.
     * @param {string} id - A ID for the RetensionObjectDetail.
     * @returns {Promise<RetensionObjectDetail>} The details of the identified RetensionObjectDetail.
     * @throws NotFoundException if the RetensionObjectDetail ID is not found
     */
    @Get('/getoutputdatausingissueid/:id')
    async finddatabasedonissueid(
        @Param('id') id: string
    ): Promise<GetRetensionObjectDetailsResponse> {
        const retensionObjectDetails = await (
            await this.retensionObjectDetailsService.findAll()
        ).filter((x) => x.issueId === id);
        const result = {
            retensionObjectDetails,
        };
        return result;
    }

    /**
     * Returns the specific details of a RetensionObjectDetail for the user.
     * @param {string} id - A ID for the RetensionObjectDetail.
     * @returns {Promise<RetensionObjectDetail>} The details of the identified RetensionObjectDetail.
     * @throws NotFoundException if the RetensionObjectDetail ID is not found
     */
    @Get('/getoutputdatausingapplicationid/:id')
    async finddatabasedonapplicationid(
        @Param('id') id: string
    ): Promise<GetRetensionObjectDetailsResponse> {
        const retensionObjectDetails = await (
            await this.retensionObjectDetailsService.findAll()
        ).filter((x) => x.applicationId === id);

        const result = {
            retensionObjectDetails,
        };

        return result;
    }

    /**
     * Returns the specific details of a RetensionObjectDetail for the user.
     * @param {string} id - A ID for the RetensionObjectDetail.
     * @param {string} applicationid - A ID for the RetensionObjectDetail.
     * @returns {Promise<RetensionObjectDetail>} The details of the identified RetensionObjectDetail.
     * @throws NotFoundException if the RetensionObjectDetail ID is not found
     */
    @Get('/getoutputdatausingissueidwithapplicationid/:id/:applicationid')
    async finddatabasedonissueidwithapplicationid(
        @Param('id') id: string,
        @Param('applicationid') applicationid: string
    ): Promise<GetRetensionObjectDetailsResponse> {
        const retensionObjectDetails = await (
            await this.retensionObjectDetailsService.findAll()
        ).filter((x) => x.issueId === id && x.applicationId === applicationid);
        const result = {
            retensionObjectDetails,
        };

        return result;
    }

    /**
     * Updates a specific RetensionObjectDetail. The ID within the RetensionObjectDetail must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the RetensionObjectDetail ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the RetensionObjectDetail to update
     * @param {UpdateRetensionObjectDetailRequest} updateRetensionObjectDetailDto - RetensionObjectDetail with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateRetensionObjectDetailDto: UpdateRetensionObjectDetailRequest
    ): Promise<void> {
        await this.retensionObjectDetailsService.update(id, updateRetensionObjectDetailDto);
    }

    /**
     * Deletes a specific RetensionObjectDetail.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific RetensionObjectDetail that has to be deleted.
     * @throws NotFoundException if the RetensionObjectDetail ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.retensionObjectDetailsService.remove(id);
    }

    /**
     * Deletes all the RetensionObjectDetail for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteRetensionObjectDetailsResponse> {
        const numRetensionObjectDetailsDeleted =
            await this.retensionObjectDetailsService.removeAll();
        return {
            numRetensionObjectDetailsDeleted,
        };
    }
}
