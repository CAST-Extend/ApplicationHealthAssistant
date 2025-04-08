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
    CreateUsermRequest,
    DeleteUsermsResponse,
    GetUsermsResponse,
    Userm,
    UpdateUsermRequest,
} from '@application-health-assistant/shared-api-model/model/userms';

import UsermsService from './userms.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The FeedbacksControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The FeedbacksController maps HTTP requests to the FeedbacksServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/userms')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class UsermsController {
    /**
     * @param {UsermsService} usermsService - instance of Feedbackservice.
     */
    constructor(private readonly usermsService: UsermsService) {}

    /**
     * Creates a new Feedback. The "Location" response header will be set to include the
     * ID of the newly created Feedback.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateUsermRequest} createUsermDto The  values for a new Feedback as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createUsermDto: CreateUsermRequest
    ): Promise<void> {
        const createdFeedbackId = await this.usermsService.create(createUsermDto);
        response.location(`${request.url}/${createdFeedbackId}`);
        response.send();
    }

    /**
     * Returns all the Feedbacks for the user. This allows the user to browse all Feedbacks in a UI.
     * @returns {Promise<GetUsermsResponse>} Response object contains an array of Feedbacks.
     */
    @Get()
    async findAll(): Promise<GetUsermsResponse> {
        const Userms = await this.usermsService.findAll();
        const result = {
            Userms,
        };

        return result;
    }

    /**
     * Returns the specific details of a Feedback for the user.
     * @param {string} id - A ID for the Feedback.
     * @returns {Promise<Userm>} The details of the identified Feedback.
     * @throws NotFoundException if the Feedback ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Userm> {
        const userm = await this.usermsService.findOne(id);

        return {
            ...userm,
        };
    }

    /**
     * Updates a specific Feedback. The ID within the Feedback must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the Feedback ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the Feedback to update
     * @param {UpdateUsermRequest} updateUsermDto - Feedback with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateUsermDto: UpdateUsermRequest
    ): Promise<void> {
        await this.usermsService.update(id, updateUsermDto);
    }

    /**
     * Deletes a specific Feedback.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific Feedback that has to be deleted.
     * @throws NotFoundException if the Feedback ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.usermsService.remove(id);
    }

    /**
     * Deletes all the Feedback for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteUsermsResponse> {
        const numUsermsDeleted = await this.usermsService.removeAll();
        return {
            numUsermsDeleted,
        };
    }

    /**
     *
     * @param user
     * @param request
     * @param response
     */
    @Get('/getUser/:user')
    async updatePullReqStatus(
        @Param('user') user: string,
        @Req() request: Request,
        @Res() response: Response
    ): Promise<any> {
        const userList = await this.usermsService.findAll();
        const data = userList.find((userCheck: any) => userCheck.userName === user);
        // return result;
        response.send({
            statuscode: response.statusCode,
            result: data,
            error: response.errored,
        });
    }
}
