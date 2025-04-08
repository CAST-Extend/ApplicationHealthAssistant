/* eslint-disable @typescript-eslint/no-unused-vars */
import { readFile } from 'fs';

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
    CreateFileContentRequest,
    DeleteFileContentsResponse,
    GetFileContentsResponse,
    UpdateFileContentRequest,
} from '@application-health-assistant/shared-api-model/model/fileContents';

import FileContentsService from './fileContents.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The FileContentsControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The FileContentsController maps HTTP requests to the FileContentsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/fileContents')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class FileContentsController {
    /**
     * @param {FileContentsService} fileContentsService - instance of FileContentservice.
     */
    constructor(private readonly fileContentsService: FileContentsService) {}

    /**
     * Creates a new FileContent. The "Location" response header will be set to include the
     * ID of the newly created FileContent.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateFileContentRequest} createFileContentDto The  values for a new FileContent as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createFileContentDto: CreateFileContentRequest
    ): Promise<void> {
        const createdFileContentId = await this.fileContentsService.create(createFileContentDto);
        response.location(`${request.url}/${createdFileContentId}`);
        response.send();
    }

    /**
     * Returns all the FileContents for the user. This allows the user to browse all FileContents in a UI.
     * @param filepath
     * @returns {Promise<GetFileContentsResponse>} Response object contains an array of FileContents.
     */

    // @Get()
    // async findAll(@Query('filepath') filepath: string) {
    //     return new Promise((resolve, reject) => {
    //         // eslint-disable-next-line consistent-return
    //         readFile(filepath, 'utf8', (err, data) => {
    //             if (err) {
    //                 console.error('Error:', err);
    //                 // eslint-disable-next-line prefer-promise-reject-errors
    //                 return reject({ message: 'Error reading file', error: err.message || err });
    //             }
    //             resolve({ fileContent: data });
    //         });
    //     });
    // }

    // /**
    //  * Returns the specific details of a FileContent for the user.
    //  * @param {string} id - A ID for the FileContent.
    //  * @returns {Promise<FileContent>} The details of the identified FileContent.
    //  * @throws NotFoundException if the FileContent ID is not found
    //  */
    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<FileContent> {
    //     const fileContent = await this.fileContentsService.findOne(id);

    //     return {
    //         ...fileContent,
    //     };
    // }
    /**
     * Returns the specific details of a FileContent for the user.
     * @param {string} id - A ID for the FileContent.
     * @returns {Promise<GetFileContentsResponse>} The details of the identified FileContent.
     * @throws NotFoundException if the FileContent ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<GetFileContentsResponse> {
        // const fileContent = await this.fileContentsService.findOne(id);

        // return {
        //     ...fileContent,
        // };
        const fileContents = (await this.fileContentsService.findAll()).filter(
            (x) => x.requestid === id
        );
        const result = {
            fileContents,
        };
        return result;
    }

    /**
     * Updates a specific FileContent. The ID within the FileContent must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the FileContent ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the FileContent to update
     * @param {UpdateFileContentRequest} updateFileContentDto - FileContent with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateFileContentDto: UpdateFileContentRequest
    ): Promise<void> {
        await this.fileContentsService.update(id, updateFileContentDto);
    }

    /**
     * Deletes a specific FileContent.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific FileContent that has to be deleted.
     * @throws NotFoundException if the FileContent ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.fileContentsService.remove(id);
    }

    /**
     * Deletes all the FileContent for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteFileContentsResponse> {
        const numFileContentsDeleted = await this.fileContentsService.removeAll();
        return {
            numFileContentsDeleted,
        };
    }
}
