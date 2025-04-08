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
    CreateApplicationDtlRequest,
    DeleteApplicationDtlsResponse,
    GetApplicationDtlsResponse,
    ApplicationDtl,
    UpdateApplicationDtlRequest,
} from '@application-health-assistant/shared-api-model/model/applicationDtls';

import ApplicationDtlsService from './applicationDtls.service';
import AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
/**
 * The ApplicationDtlsControlimport AllowControllerWithNoBearer from '../app/common/allowControllerWithNoBearer';
 
/**
 * The ApplicationDtlsController maps HTTP requests to the ApplicationDtlsServices. It takes care of
 * mechanics related to REST, such as returning the correct HTTP status code.
 *
 * Unless otherwise stated HTTP response codes on successful completion of calls
 * are set to 200.
 */
@Controller('/applicationDtls')
@UseInterceptors(ClassSerializerInterceptor)
@AllowControllerWithNoBearer()
export default class ApplicationDtlsController {
    /**
     * @param {ApplicationDtlsService} applicationDtlsService - instance of ApplicationDtlservice.
     */
    constructor(private readonly applicationDtlsService: ApplicationDtlsService) {}

    /**
     * Creates a new ApplicationDtl. The "Location" response header will be set to include the
     * ID of the newly created ApplicationDtl.
     *
     * Nest ensures that a HTTP response status code of 201 is set when this method
     * completes successfully.
     * @param {Request}  request The express request object. Injected by Nest at runtime.
     * @param {Response} response The express response object. Injected by Nest at runtime.
     * @param {CreateApplicationDtlRequest} createApplicationDtlDto The  values for a new ApplicationDtl as per the OpenAPI schema object.
     */
    @Post()
    async create(
        @Req() request: Request,
        @Res() response: Response,
        @Body() createApplicationDtlDto: CreateApplicationDtlRequest
    ): Promise<void> {
        const createdApplicationDtlId =
            await this.applicationDtlsService.create(createApplicationDtlDto);
        response.location(`${request.url}/${createdApplicationDtlId}`);
        response.send();
    }

    /**
     * Returns all the ApplicationDtls for the user. This allows the user to browse all ApplicationDtls in a UI.
     * @returns {Promise<GetApplicationDtlsResponse>} Response object contains an array of ApplicationDtls.
     */
    @Get()
    async findAll(): Promise<GetApplicationDtlsResponse> {
        const applicationDtls = await this.applicationDtlsService.findAll();
        const result = {
            applicationDtls,
        };
        // const response = await fetch(
        //     'http://usdf11v1187.mercer.com:5000/rest/tenants/default/applications/MER_-_CLNPAR_-_Client_Participation_Survey_Mgmt_System/insights/green-detection-patterns/1200136/findings?limit=400'
        // );
        // const data = await response.json();
        // console.log(data);
        applicationDtls.sort((a, b) => {
            // Replace 'propertyName' with the actual property you want to sort by
            if (a.CAST_AppName < b.CAST_AppName) return -1;
            if (a.CAST_AppName > b.CAST_AppName) return 1;
            return 0;
        });

        return result;
    }

    /**
     * Returns the ApplicationDtls for the specified name. This allows the user to retrieve specific ApplicationDtls based on the provided name.
     * @param name
     * @returns {Promise<any>} Response object containing ApplicationDtls from the CAST API.
     */
    @Get('getCastInfo')
    async getCastInfo(@Query('name') name: string): Promise<any> {
        try {
			console.log("in getCastInfo");
            const applicationDtls = await this.applicationDtlsService.GetCastInfo(name);
            return applicationDtls;
        } catch (error) {
            return {
                status: 'error',
                message: error.message || 'An unexpected error occurred',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            };
        }
    }

    /**
     * Returns the ApplicationDtls for the specified name. This allows the user to retrieve specific ApplicationDtls based on the provided name.
     * @param {name: String}
     * @param {issueId: String}
     * @param name
     * @param issueId
     * @returns {Promise<any>} Response object containing ApplicationDtls from the CAST API.
     */
    @Get('getCastInfoForObject')
    async getCastInfoForObject(
        @Query('name') name: string,
        @Query('issueId') issueId: string
    ): Promise<any> {
        // Call the service method to get the ApplicationDtls based on the name
        const objDetails = await this.applicationDtlsService.GetCastObjectInfo(name, issueId);

        objDetails.sort((a, b) => {
            // Replace 'propertyName' with the actual property you want to sort by
            if (a.CAST_AppName < b.CAST_AppName) return -1;
            if (a.CAST_AppName > b.CAST_AppName) return 1;
            return 0;
        });
        // Return the applicationDtls directly
        return objDetails;
    }
    // Uncomment and modify the fetch request as needed
    // const response = await fetch(
    //     `http://usdf11v1187.mercer.com:5000/rest/tenants/default/applications/MER_-_CLNPAR_-_Client_Participation_Survey_Mgmt_System/insights/green-detection-patterns/1200136/findings?limit=400`
    // );
    // const data = await response.json();

    /**
     * Returns the specific details of a ApplicationDtl for the user.
     * @param {string} id - A ID for the ApplicationDtl.
     * @returns {Promise<ApplicationDtl>} The details of the identified ApplicationDtl.
     * @throws NotFoundException if the ApplicationDtl ID is not found
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ApplicationDtl> {
        const applicationDtl = await this.applicationDtlsService.findOne(id);

        return {
            ...applicationDtl,
        };
    }

    /**
     * Updates a specific ApplicationDtl. The ID within the ApplicationDtl must be the same as that provided as a path parameter.
     *
     * Throws a NotFoundException if the ApplicationDtl ID is not found.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the ApplicationDtl to update
     * @param {UpdateApplicationDtlRequest} updateApplicationDtlDto - ApplicationDtl with new object properties.
     */
    @Put(':id')
    @HttpCode(204)
    async update(
        @Param('id') id: string,
        @Body() updateApplicationDtlDto: UpdateApplicationDtlRequest
    ): Promise<void> {
        await this.applicationDtlsService.update(id, updateApplicationDtlDto);
    }

    /**
     * Deletes a specific ApplicationDtl.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     * @param {string} id - ID of the specific ApplicationDtl that has to be deleted.
     * @throws NotFoundException if the ApplicationDtl ID is not found
     */
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.applicationDtlsService.remove(id);
    }

    /**
     * Deletes all the ApplicationDtl for the user.
     *
     * Sets a HTTP response status code of 204 when this method completes successfully.
     */
    @Delete()
    async removeAll(): Promise<DeleteApplicationDtlsResponse> {
        const numApplicationDtlsDeleted = await this.applicationDtlsService.removeAll();
        return {
            numApplicationDtlsDeleted,
        };
    }
}
