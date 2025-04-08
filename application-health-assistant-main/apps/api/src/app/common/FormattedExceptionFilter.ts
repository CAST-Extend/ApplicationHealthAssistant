import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Ensures that error messages are in the format required by the Core API team's API standards.
 */
@Catch(HttpException)
export default class FormattedExceptionFilter implements ExceptionFilter {
    exceptionTemplates = {};

    /**
     * Constructs a new instance of the `FormattedExceptionFilter` class.
     * Initializes the `exceptionTemplates` map with default response templates for various HTTP status codes.
     */
    constructor() {
        this.exceptionTemplates[HttpStatus.INTERNAL_SERVER_ERROR] = {
            type: '/probs/ApplicationException',
            title: 'Application error occurred',
            status: String(HttpStatus.INTERNAL_SERVER_ERROR),
        };

        this.exceptionTemplates[HttpStatus.BAD_REQUEST] = {
            type: '/probs/BadRequest',
            title: 'Bad request submitted by client',
            status: String(HttpStatus.BAD_REQUEST),
        };

        this.exceptionTemplates[HttpStatus.UNAUTHORIZED] = {
            type: '/probs/Unauthorized',
            title: 'Credentials required but not received or invalid',
            status: String(HttpStatus.UNAUTHORIZED),
        };

        this.exceptionTemplates[HttpStatus.FORBIDDEN] = {
            type: '/probs/Forbidden',
            title: 'Credentials received but not appropriate for this action',
            status: String(HttpStatus.FORBIDDEN),
        };

        this.exceptionTemplates[HttpStatus.NOT_FOUND] = {
            type: '/probs/NotFound',
            title: 'The requested resource was not found',
            status: String(HttpStatus.NOT_FOUND),
        };

        this.exceptionTemplates[HttpStatus.CONFLICT] = {
            type: '/probs/Conflict',
            title: 'The request could not be completed due to a conflict with the current state of the target resource.',
            status: String(HttpStatus.CONFLICT),
        };
    }

    /**
     * Handles an exception by formatting the response and sending it to the client.
     * @param {HttpException} exception - The exception to handle.
     * @param {ArgumentsHost} host - An object containing information about the current request and response.
     */
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        Logger.error(exception.getStatus());
        Logger.error(exception.stack);

        const errMessage = this.getErrorPayload(exception, request.url);

        // Not joining these calls on the response makes the mocking in the unit test slightly easier.
        // Parsing the error message status to ensure consistency of response codes with messages.
        response.status(Number.parseInt(errMessage.status, 10));
        response.json(errMessage);
    }

    /**
     * Gets the error payload to be sent to the client in the response.
     * @param {HttpException} exception - The exception to handle.
     * @param {string} path - The URL path of the current request.
     * @returns {object} An object containing the error payload.
     */
    getErrorPayload(exception: HttpException, path: string) {
        let response = this.exceptionTemplates[exception.getStatus().toString()];

        // Default to internal server error.
        if (!response) {
            response = this.exceptionTemplates[HttpStatus.INTERNAL_SERVER_ERROR];
        }

        const errorResponse = {
            detail: exception.message,
            instance: path,
            ...response,
        };

        return errorResponse;
    }
}
