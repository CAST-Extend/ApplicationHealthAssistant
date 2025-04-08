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
    CreateFeedbackRequest,
    DeleteFeedbacksResponse,
    GetFeedbacksResponse,
    Feedback,
    UpdateFeedbackRequest,
} from '@application-health-assistant/shared-api-model/model/feedbacks';

import FeedbacksService from './feedbacks.service';
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
@Controller('/feedbacks')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class FeedbacksController {
    /**
     * @param {FeedbacksService} feedbacksService - instance of Feedbackservice.
     */
    constructor(private readonly feedbacksService: FeedbacksService) {}

    /**
     * Creates a new Feedback. The "Location" response header will be set to include the
     * ID of the newly created Feedback.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateFeedbackRequest} createFeedbackDto The  values for a new Feedback as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createFeedbackDto: CreateFeedbackRequest
    ): Promise<void> {
        const createdFeedbackId = await this.feedbacksService.create(createFeedbackDto);
        response.location(`${request.url}/${createdFeedbackId}`);
        response.send();
    }

    /**
     * Returns all the Feedbacks for the user. This allows the user to browse all Feedbacks in a UI.
     * @returns {Promise<GetFeedbacksResponse>} Response object contains an array of Feedbacks.
     */
    @Get()
    async findAll(): Promise<GetFeedbacksResponse> {
        const feedbacks = await this.feedbacksService.findAll();
        const result = {
            feedbacks,
        };

        return result;
    }

    /**
     * Returns the specific details of a Feedback for the user.
     * @param {string} id - A ID for the Feedback.
     * @returns {Promise<Feedback>} The details of the identified Feedback.
     * @throws NotFoundException if the Feedback ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Feedback> {
        const feedback = await this.feedbacksService.findOne(id);

        return {
            ...feedback,
        };
    }

    /**
     * Updates a specific Feedback. The ID within the Feedback must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the Feedback ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the Feedback to update
     * @param {UpdateFeedbackRequest} updateFeedbackDto - Feedback with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateFeedbackDto: UpdateFeedbackRequest
    ): Promise<void> {
        await this.feedbacksService.update(id, updateFeedbackDto);
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
        await this.feedbacksService.remove(id);
    }

    /**
     * Deletes all the Feedback for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteFeedbacksResponse> {
        const numFeedbacksDeleted = await this.feedbacksService.removeAll();
        return {
            numFeedbacksDeleted,
        };
    }
}
