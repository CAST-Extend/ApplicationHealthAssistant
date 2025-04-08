import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreateRetensionObjectDetailRequest,
    GetRetensionObjectDetailsResponse,
    RetensionObjectDetail,
} from '@application-health-assistant/shared-api-model/model/retensionObjectDetails';

import RetensionObjectDetailsTestUtils from './RetensionObjectDetailsTestUtils';
import mockRetensionObjectDetailsId from './mockRetensionObjectDetailsId';
import RetensionObjectDetailsController from './retensionObjectDetails.controller';
import RetensionObjectDetailsService from './retensionObjectDetails.service';
import sampleRetensionObjectDetails from './sampleRetensionObjectDetails';
import { RetensionObjectDetail as DataModelTask } from './schemas/RetensionObjectDetails.schema';

const mockedRetensionObjectDetailsService = tsm.mock(RetensionObjectDetailsService);
const mockedRetensionObjectDetailsServiceInstance = tsm.instance(
    mockedRetensionObjectDetailsService
);

describe('With RetensionObjectDetailsController', () => {
    let controller: RetensionObjectDetailsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RetensionObjectDetailsController],
            providers: [
                {
                    provide: RetensionObjectDetailsService,
                    useValue: mockedRetensionObjectDetailsServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<RetensionObjectDetailsController>(RetensionObjectDetailsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedRetensionObjectDetailsService.findAll()).thenReturn(
            Promise.resolve(sampleRetensionObjectDetails)
        );
        expect(await controller.findAll()).toEqual({
            retensionObjectDetails: sampleRetensionObjectDetails,
        } as GetRetensionObjectDetailsResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/retensionObjectDetails' });
        const response = mock<Response>();

        const task = RetensionObjectDetailsTestUtils.mockRetensionObjectDetailWithId(
            '8'
        ) as CreateRetensionObjectDetailRequest;

        const taskId = mockRetensionObjectDetailsId();
        tsm.when(mockedRetensionObjectDetailsService.create(task)).thenReturn(
            Promise.resolve(taskId)
        );

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedRetensionObjectDetailsService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/retensionObjectDetails/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = RetensionObjectDetailsTestUtils.mockRetensionObjectDetailWithId('8');
        await controller.update(task.id, task);
        tsm.verify(mockedRetensionObjectDetailsService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = RetensionObjectDetailsTestUtils.mockRetensionObjectDetailWithId('8');
        tsm.when(mockedRetensionObjectDetailsService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as RetensionObjectDetail);
    });

    it('calls remove by ID', async () => {
        const taskId = mockRetensionObjectDetailsId();
        await controller.remove(taskId);
        tsm.verify(mockedRetensionObjectDetailsService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedRetensionObjectDetailsService.removeAll()).once();
    });
});
