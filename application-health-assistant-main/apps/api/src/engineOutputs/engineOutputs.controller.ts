/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/no-undefined-types */
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
    Query,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
    CreateEngineOutputRequest,
    DeleteEngineOutputsResponse,
    GetEngineOutputsResponse,
    EngineOutput,
    UpdateEngineOutputRequest,
} from '@application-health-assistant/shared-api-model/model/engineOutputs';

import EngineOutputsService from './engineOutputs.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The EngineOutputsControl import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The EngineOutputsController maps HTTP requests to the EngineOutputsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/engineOutputs')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class EngineOutputsController {
    /**
     * @param {EngineOutputsService} engineOutputsService - instance of EngineOutputservice.
     */
    constructor(private readonly engineOutputsService: EngineOutputsService) {}

    /**
     * Creates a new EngineOutput. The "Location" response header will be set to include the
     * ID of the newly created EngineOutput.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateEngineOutputRequest} createEngineOutputDto The  values for a new EngineOutput as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createEngineOutputDto: CreateEngineOutputRequest
    ): Promise<void> {
        const createdEngineOutputId = await this.engineOutputsService.create(createEngineOutputDto);
        response.location(`${request.url}/${createdEngineOutputId}`);
        response.send();
    }

    /**
     * Returns all the EngineOutputs for the user. This allows the user to browse all EngineOutputs in a UI.
     * @returns {Promise<GetEngineOutputsResponse>} Response object contains an array of EngineOutputs.
     */
    @Get()
    async findAll(): Promise<GetEngineOutputsResponse> {
        const engineOutputs = await this.engineOutputsService.findAll();
        const result = {
            engineOutputs,
        };

        return result;
    }

    /**
     * Returns the specific details of EngineOutputs based on filter criteria provided as query parameters.
     * @param key
     * @query {string} key The key against EngineOutputObject collection on which filter is to be performed.
     * @param value
     * @query {string} value Value of above key against EngineOutputObject collection on which filter is to be performed.
     * @returns {Promise<EngineOutput>} The filtered EngineOutputs.
     * @throws NotFoundException if no EngineOutputs match the filter criteria
     */
    @Get('/filterEngineOutputs')
    async filterEngineOutputs(
        @Query('key') key: string,
        @Query('value') value: string
    ): Promise<EngineOutput> {
        const engineOutput = (await this.engineOutputsService.findAll()).find(
            (x) => x[key] === value
        );
        return engineOutput;
    }

    /**
     * Returns the specific details of a EngineOutput for the user.
     * @param {string} id - A ID for the EngineOutput.
     * @returns {Promise<EngineOutput>} The details of the identified EngineOutput.
     * @throws NotFoundException if the EngineOutput ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<EngineOutput> {
        const engineOutput = await this.engineOutputsService.findOne(id);

        return {
            ...engineOutput,
        };
    }

    /**
     * Returns the specific details of a EngineOutput for the user.
     * @param {string} id - A ID for the EngineOutput.
     * @returns {Promise<EngineOutput>} The details of the identified EngineOutput.
     * @throws NotFoundException if the EngineOutput ID is not found
     */
    @Get('/getoutputdatausingissueid/:id')
    async finddatabasedonissueid(@Param('id') id: string): Promise<GetEngineOutputsResponse> {
        const engineOutputs = await (
            await this.engineOutputsService.findAll()
        ).filter((x) => x.issueid === id);
        const result = {
            engineOutputs,
        };

        return result;
    }

    /**
     * Returns the specific details of a EngineOutput for the user.
     * @param {string} id - A ID for the EngineOutput.
     * @param {string} applicationid - A ID for the EngineOutput.
     * @returns {Promise<EngineOutput>} The details of the identified EngineOutput.
     * @throws NotFoundException if the EngineOutput ID is not found
     */
    @Get('/getoutputdatausingissueidwithapplicationid/:id/:applicationid')
    async finddatabasedonissueidwithapplicationid(
        @Param('id') id: string,
        @Param('applicationid') applicationid: string
    ): Promise<GetEngineOutputsResponse> {
        const engineOutputs = await (
            await this.engineOutputsService.findAll()
        ).filter((x) => x.issueid === id && x.applicationid === applicationid);
        const result = {
            engineOutputs,
        };

        return result;
    }

    /**
     * Updates a specific EngineOutput. The ID within the EngineOutput must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the EngineOutput ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the EngineOutput to update
     * @param {UpdateEngineOutputRequest} updateEngineOutputDto - EngineOutput with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateEngineOutputDto: UpdateEngineOutputRequest
    ): Promise<void> {
        await this.engineOutputsService.update(id, updateEngineOutputDto);
    }

    /**
     * Deletes a specific EngineOutput.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific EngineOutput that has to be deleted.
     * @throws NotFoundException if the EngineOutput ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.engineOutputsService.remove(id);
    }

    /**
     * Deletes all the EngineOutput for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteEngineOutputsResponse> {
        const numEngineOutputsDeleted = await this.engineOutputsService.removeAll();
        return {
            numEngineOutputsDeleted,
        };
    }
}
