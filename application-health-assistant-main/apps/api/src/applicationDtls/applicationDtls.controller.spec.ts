import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreateApplicationDtlRequest,
    GetApplicationDtlsResponse,
    ApplicationDtl,
} from '@application-health-assistant/shared-api-model/model/applicationDtls';

import ApplicationDtlsTestUtils from './ApplicationDtlsTestUtils';
import ApplicationDtlsController from './applicationDtls.controller';
import ApplicationDtlsService from './applicationDtls.service';
import mockApplicationDtlsId from './mockApplicationDtlsId';
import sampleApplicationDtls from './sampleApplicationDtls';
import { ApplicationDtl as DataModelTask } from './schemas/ApplicationDtls.schema';

const mockedApplicationDtlsService = tsm.mock(ApplicationDtlsService);
const mockedApplicationDtlsServiceInstance = tsm.instance(mockedApplicationDtlsService);

describe('With ApplicationDtlsController', () => {
    let controller: ApplicationDtlsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationDtlsController],
            providers: [
                {
                    provide: ApplicationDtlsService,
                    useValue: mockedApplicationDtlsServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<ApplicationDtlsController>(ApplicationDtlsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedApplicationDtlsService.findAll()).thenReturn(
            Promise.resolve(sampleApplicationDtls)
        );
        expect(await controller.findAll()).toEqual({
            applicationDtls: sampleApplicationDtls,
        } as GetApplicationDtlsResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/applicationDtls' });
        const response = mock<Response>();

        const task = ApplicationDtlsTestUtils.mockApplicationDtlWithId(
            1
        ) as CreateApplicationDtlRequest;

        const taskId = mockApplicationDtlsId();
        tsm.when(mockedApplicationDtlsService.create(task)).thenReturn(Promise.resolve(taskId));

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedApplicationDtlsService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/applicationDtls/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = ApplicationDtlsTestUtils.mockApplicationDtlWithId(1);
        await controller.update(task.id, task);
        tsm.verify(mockedApplicationDtlsService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = ApplicationDtlsTestUtils.mockApplicationDtlWithId(1);
        tsm.when(mockedApplicationDtlsService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as ApplicationDtl);
    });

    it('calls remove by ID', async () => {
        const taskId = mockApplicationDtlsId();
        await controller.remove(taskId);
        tsm.verify(mockedApplicationDtlsService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedApplicationDtlsService.removeAll()).once();
    });
});
