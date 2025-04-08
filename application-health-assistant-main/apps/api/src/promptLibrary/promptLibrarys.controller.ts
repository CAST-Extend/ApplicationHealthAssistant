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
    CreateCustomPromptLibraryResponse,
    CreatePromptLibraryRequest,
    DeleteCustomPromptLibraryResponse,
    DeletePromptLibrarysResponse,
    GetPromptLibrarysResponse,
    PromptLibrary,
    UpdateCustomPromptLibraryResponse,
    UpdatePromptLibraryRequest,
} from '@application-health-assistant/shared-api-model/model/promptLibrarys';

import PromptLibrarysService from './promptLibrarys.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';

/**
 * The PromptLibrarysControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The PromptLibrarysController maps HTTP requests to the PromptLibrarysServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/promptLibrarys')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class PromptLibrarysController {
    /**
     * @param {PromptLibrarysService} promptLibrarysService - instance of PromptLibraryservice.
     */
    constructor(private readonly promptLibrarysService: PromptLibrarysService) {}

    /**
     * Creates a new PromptLibrary. The "Location" response header will be set to include the
     * ID of the newly created PromptLibrary.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreatePromptLibraryRequest} createPromptLibraryDto The  values for a new PromptLibrary as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createPromptLibraryDto: CreatePromptLibraryRequest
    ): Promise<void> {
        const createdPromptLibraryId =
            await this.promptLibrarysService.create(createPromptLibraryDto);
        response.location(`${request.url}/${createdPromptLibraryId}`);
        response.send();
    }

    /**
     * Creates a new PromptLibrary. The "Location" response header will be set to include the
     * ID of the newly created PromptLibrary.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreatePromptLibraryRequest} createPromptLibraryDto The  values for a new PromptLibrary as per the OpenAPI schema object.
     */
    @Post('customPrompt')
    async addPrompt(
        @Body() createPromptLibraryDto: CreatePromptLibraryRequest
    ): Promise<CreateCustomPromptLibraryResponse> {
        const reqresult = await this.getlibrarybyissueid(createPromptLibraryDto.issueid);

        if (reqresult.promptLibrarys.length > 0) {
            const promptLibObj = reqresult.promptLibrarys[0];
            const i = promptLibObj.technologies.findIndex(
                (tech) => tech.technology === createPromptLibraryDto.technologies[0].technology
            );
            if (i >= 0) {
                promptLibObj.technologies[i].prompts.push(
                    createPromptLibraryDto.technologies[0].prompts[0]
                );
            } else {
                promptLibObj.technologies.push(createPromptLibraryDto.technologies[0]);
            }
            await this.promptLibrarysService.update(promptLibObj.id, promptLibObj);
        } else {
            await this.promptLibrarysService.create(createPromptLibraryDto);
        }

        return { statusCode: 204, result: '', message: 'Prompt has been added successfully!' };
    }

    /**
     * Updates a specific PromptLibrary. The ID within the PromptLibrary must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the PromptLibrary ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the PromptLibrary to update
     * @param {UpdatePromptLibraryRequest} updatePromptLibraryDto - PromptLibrary with new object properties.
     */
    @Put('customPrompt/:id')
    async updatePrompt(
        @Param('id') id: string,
        @Body() updatePromptLibraryDto: UpdatePromptLibraryRequest
    ): Promise<UpdateCustomPromptLibraryResponse> {
        await this.update(id, updatePromptLibraryDto);
        return { statusCode: 204, result: '', message: 'Prompt has been updated successfully!' };
    }

    /**
     * Updates a specific PromptLibrary. The ID within the PromptLibrary must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the PromptLibrary ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the PromptLibrary to update
     * @param {UpdatePromptLibraryRequest} updatePromptLibraryDto - PromptLibrary with new object properties.
     */
    @Delete('customPrompt/:id')
    async deletePrompt(
        @Param('id') id: string,
        @Body() updatePromptLibraryDto: UpdatePromptLibraryRequest
    ): Promise<DeleteCustomPromptLibraryResponse> {
        if (updatePromptLibraryDto.technologies.length <= 1)
            return { statusCode: 400, result: '', message: 'Minimum one prompt is required!' };
        await this.update(id, updatePromptLibraryDto);
        return { statusCode: 204, result: '', message: 'Prompt has been removed successfully!' };
    }

    /**
     * Returns all the PromptLibrarys for the user. This allows the user to browse all PromptLibrarys in a UI.
     * @returns {Promise<GetPromptLibrarysResponse>} Response object contains an array of PromptLibrarys.
     */
    @Get()
    async findAll(): Promise<GetPromptLibrarysResponse> {
        const promptLibrarys = await this.promptLibrarysService.findAll();
        const result = {
            promptLibrarys,
        };

        return result;
    }

    /**
     * Returns the specific details of a PromptLibrary for the user.
     * @param {number} id - A ID for the PromptLibrary.
     * @returns {Promise<PromptLibrary>} The details of the identified PromptLibrary.
     * @throws NotFoundException if the PromptLibrary ID is not found
     */
    @Get(':id')
    async getlibrarybyissueid(@Param('id') id: number): Promise<GetPromptLibrarysResponse> {
        const promptLibrarys = await (
            await this.promptLibrarysService.findAll()
        ).filter((x) => x.issueid === Number(id));
        const result = {
            promptLibrarys,
        };
        return result;
    }

    /**
     * Returns the specific details of a PromptLibrary for the user.
     * @param {number} id - A ID for the PromptLibrary.
     * @param {string} technology - A ID for the PromptLibrary.
     * @returns {Promise<PromptLibrary>} The details of the identified PromptLibrary.
     * @throws NotFoundException if the PromptLibrary ID is not found
     */

    /**
     *
     * @param id
     * @param technology
     */
    @Get('/getlibrarybyissueidwithtechnology/:id/:technology')
    async getlibrarybyissueidwithtechnology(
        @Param('id') id: number,
        @Param('technology') technology: string
    ) {
        const promptLibrarys = await (
            await this.promptLibrarysService.findAll()
        )
            .filter((x) => x.issueid === Number(id))
            .map((project) => ({
                id: project.id,
                applicationid: project.applicationid,
                type: project.type,
                enabled: project.enabled,
                issueid: project.issueid,
                issuename: project.issuename,
                prompttype: project.prompttype,
                technologies: project.technologies.filter((tech) => tech.technology === technology), // Filter technology
            }))
            .filter((project) => project.technologies.length > 0);
        console.log('promptLibrarys');
        console.log(promptLibrarys);
        //            return  promptLibrarys;
        const result = promptLibrarys;
        return result;
    }

    /**
     * Returns the specific details of a PromptLibrary for the user.
     * @param {string} id - A ID for the PromptLibrary.
     * @returns {Promise<PromptLibrary>} The details of the identified PromptLibrary.
     * @throws NotFoundException if the PromptLibrary ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PromptLibrary> {
        const promptLibrary = await this.promptLibrarysService.findOne(id);

        return {
            ...promptLibrary,
        };
    }

    /**
     * Updates a specific PromptLibrary. The ID within the PromptLibrary must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the PromptLibrary ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the PromptLibrary to update
     * @param {UpdatePromptLibraryRequest} updatePromptLibraryDto - PromptLibrary with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updatePromptLibraryDto: UpdatePromptLibraryRequest
    ): Promise<void> {
        await this.promptLibrarysService.update(id, updatePromptLibraryDto);
    }

    /**
     * Deletes a specific PromptLibrary.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific PromptLibrary that has to be deleted.
     * @throws NotFoundException if the PromptLibrary ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.promptLibrarysService.remove(id);
    }

    /**
     * Deletes all the PromptLibrary for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeletePromptLibrarysResponse> {
        const numPromptLibrarysDeleted = await this.promptLibrarysService.removeAll();
        return {
            numPromptLibrarysDeleted,
        };
    }
}
