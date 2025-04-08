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
    CreateEngineInputRequest,
    DeleteEngineInputsResponse,
    GetEngineInputsResponse,
    EngineInput,
    UpdateEngineInputRequest,
} from '@application-health-assistant/shared-api-model/model/engineInputs';

import EngineInputsService from './engineInputs.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The EngineInputsControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The EngineInputsController maps HTTP requests to the EngineInputsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/engineInputs')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class EngineInputsController {
    /**
     * @param {EngineInputsService} engineInputsService - instance of EngineInputservice.
     */
    constructor(private readonly engineInputsService: EngineInputsService) {}

    /**
     * Creates a new EngineInput. The "Location" response header will be set to include the
     * ID of the newly created EngineInput.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateEngineInputRequest} createEngineInputDto The  values for a new EngineInput as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createEngineInputDto: CreateEngineInputRequest
    ): Promise<void> {
        const createdEngineInputId = await this.engineInputsService.create(createEngineInputDto);

        response.location(`${request.url}/${createdEngineInputId}`);
        response.send({
            statuscode: response.statusCode,
            createdEngineInputId,
            error: response.errored,
        });
    }

    /**
     * Returns all the EngineInputs for the user. This allows the user to browse all EngineInputs in a UI.
     * @returns {Promise<GetEngineInputsResponse>} Response object contains an array of EngineInputs.
     */
    @Get()
    async findAll(): Promise<GetEngineInputsResponse> {
        const engineInputs = await this.engineInputsService.findAll();
        const result = {
            engineInputs,
        };

        return result;
    }

    /**
     * Returns the specific details of a EngineInput for the user.
     * @param {string} id - A ID for the EngineInput.
     * @returns {Promise<EngineInput>} The details of the identified EngineInput.
     * @throws NotFoundException if the EngineInput ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<EngineInput> {
        const engineInput = await this.engineInputsService.findOne(id);

        return {
            ...engineInput,
        };
    }

    /**
     * Returns the specific details of a EngineOutput for the user.
     * @param {string} id - A ID for the EngineOutput.
     * @param {string} applicationid - A ID for the EngineOutput.
     * @returns {Promise<EngineInput>} The details of the identified EngineOutput.
     * @throws NotFoundException if the EngineOutput ID is not found
     */
    @Get('/getinputdatausingissueidwithapplicationid/:id/:applicationid')
    async finddatabasedonissueidwithapplicationid(
        @Param('id') id: string,
        @Param('applicationid') applicationid: string
    ): Promise<GetEngineInputsResponse> {
        const engineInputs = await (
            await this.engineInputsService.findAll()
        )
            .filter(
                (x: any) =>
                    x.request[0].issueid === id && x.request[0].applicationid === applicationid
            )
            .sort((a, b) => {
                const dateA = new Date((a as any).createddate).getTime(); // Convert to timestamp
                const dateB = new Date((b as any).createddate).getTime();
                return dateB - dateA; // Compare timestamps for latest first.
            });
        const result = {
            engineInputs,
        };

        return result;
    }

    /**
     * Updates a specific EngineInput. The ID within the EngineInput must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the EngineInput ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the EngineInput to update
     * @param {UpdateEngineInputRequest} updateEngineInputDto - EngineInput with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateEngineInputDto: UpdateEngineInputRequest
    ): Promise<void> {
        await this.engineInputsService.update(id, updateEngineInputDto);
    }

    /**
     * Deletes a specific EngineInput.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific EngineInput that has to be deleted.
     * @throws NotFoundException if the EngineInput ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.engineInputsService.remove(id);
    }

    /**
     * Deletes all the EngineInput for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteEngineInputsResponse> {
        const numEngineInputsDeleted = await this.engineInputsService.removeAll();
        return {
            numEngineInputsDeleted,
        };
    }

    /**
     * Returns the specific details of a EngineOutput for the user.
     * @param {string} id - A ID for the EngineOutput.
     * @param {string} applicationid - A ID for the EngineOutput.
     * @param request
     * @param response
     * @param updateEngineInputDto
     * @returns {Promise<EngineInput>} The details of the identified EngineOutput.
     * @throws NotFoundException if the EngineOutput ID is not found
     */
    @Post('/updateFlag')
    async updatePullReqStatus(
        @Req() request: Request,
        @Res() response: Response,
        @Body() updateEngineInputDto: CreateEngineInputRequest
    ): Promise<any> {
        const engineInputs = await await this.engineInputsService.findAll();
        const data = engineInputs.find(
            (ipData: any) => ipData.request[0].requestid === updateEngineInputDto.requestid
        );
        if (updateEngineInputDto.flag === 'pullreqraised') {
            data.request[0].pullreqraised = updateEngineInputDto.pullReqraisedFlag;
        } else {
            data.request[0].status = 'Queued';
        }
        await this.update(data.id, data);
        // return result;
        response.send({
            statuscode: response.statusCode,
            result: 'Flag updated successfully',
            error: response.errored,
        });
    }
}
