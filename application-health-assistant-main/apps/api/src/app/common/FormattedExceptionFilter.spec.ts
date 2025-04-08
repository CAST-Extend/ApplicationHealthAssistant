/* eslint-disable jest/expect-expect */
import {
    ArgumentsHost,
    BadGatewayException,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';

import FormattedExceptionFilter from './FormattedExceptionFilter';

/**
 * Checks that the test exception is correctly marshalled into a response
 * @param {FormattedExceptionFilter} toTest The class under test in the unit tests.
 * @param {HttpException} testException The exception to pass to the class-under-test's catch function.
 * @param {number} statusCode The status code that is expected to be passed to the express Response object.
 * @param {object} expectedResponse The response that is expected to be passed as the body to the express Response object.
 * @param {string} expectedResponse.detail The additional response as the body of the exception.
 * @param {string} expectedResponse.instance the path or resource responsible for the error.
 * @param {string} expectedResponse.status The HTTP response status.
 * @param {string} expectedResponse.title The title of the HTTP error.
 * @param {string} expectedResponse.type Type of the HTTP Exception.
 */
function checkExceptionResponseIsExpected(
    toTest: FormattedExceptionFilter,
    testException: HttpException,
    statusCode: number,
    expectedResponse: {
        detail: string;
        instance: string;
        status: string;
        title: string;
        type: string;
    }
) {
    const request = mock<Request>({ url: 'a test url value' });
    const response = mock<Response>();
    const httpArgumentsHost = mock<HttpArgumentsHost>();
    httpArgumentsHost.getRequest.mockReturnValueOnce(request);
    httpArgumentsHost.getResponse.mockReturnValueOnce(response);
    const argumentsHost = mock<ArgumentsHost>();
    argumentsHost.switchToHttp.mockReturnValueOnce(httpArgumentsHost);

    toTest.catch(testException, argumentsHost);

    expect(response.status).toHaveBeenCalledWith(statusCode);
    expect(response.json).toHaveBeenCalledWith(expectedResponse);
}

describe('Exception formatting is to standards', () => {
    let toTest: FormattedExceptionFilter;

    beforeEach(() => {
        toTest = new FormattedExceptionFilter();
    });

    it('Not found exception', () => {
        const testException = new NotFoundException('asdf');
        const expectedResponse = {
            detail: 'asdf',
            instance: 'a test url value',
            status: '404',
            title: 'The requested resource was not found',
            type: '/probs/NotFound',
        };

        checkExceptionResponseIsExpected(
            toTest,
            testException,
            HttpStatus.NOT_FOUND,
            expectedResponse
        );
    });

    it('Bad request exception', () => {
        const testException = new BadRequestException('bbbb bbbb');
        const expectedResponse = {
            detail: 'bbbb bbbb',
            instance: 'a test url value',
            status: '400',
            title: 'Bad request submitted by client',
            type: '/probs/BadRequest',
        };

        checkExceptionResponseIsExpected(
            toTest,
            testException,
            HttpStatus.BAD_REQUEST,
            expectedResponse
        );
    });

    it('Internal server error', () => {
        const testException = new InternalServerErrorException('iiii iiii');
        const expectedResponse = {
            detail: 'iiii iiii',
            instance: 'a test url value',
            status: '500',
            title: 'Application error occurred',
            type: '/probs/ApplicationException',
        };

        checkExceptionResponseIsExpected(
            toTest,
            testException,
            HttpStatus.INTERNAL_SERVER_ERROR,
            expectedResponse
        );
    });

    it('Converts an unhandled exception to a 500', () => {
        // The filter does not have code specifically for
        // a UnauthorizedException. It should convert it to a 500.
        const testException = new BadGatewayException('No more resource');
        const expectedResponse = {
            detail: 'No more resource',
            instance: 'a test url value',
            status: '500',
            title: 'Application error occurred',
            type: '/probs/ApplicationException',
        };

        checkExceptionResponseIsExpected(
            toTest,
            testException,
            HttpStatus.INTERNAL_SERVER_ERROR,
            expectedResponse
        );
    });
});
