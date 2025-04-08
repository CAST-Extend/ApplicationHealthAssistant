import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreateEngineOutputRequest,
    GetEngineOutputsResponse,
    EngineOutput,
} from '@application-health-assistant/shared-api-model/model/engineOutputs';

import EngineOutputsTestUtils from './EngineOutputsTestUtils';
import EngineOutputsController from './engineOutputs.controller';
import EngineOutputsService from './engineOutputs.service';
import mockEngineOutputsId from './mockEngineOutputsId';
import sampleEngineOutputs from './sampleEngineOutputs';
import { EngineOutput as DataModelTask } from './schemas/Engineoutputs.schema';

const mockedEngineOutputsService = tsm.mock(EngineOutputsService);
const mockedEngineOutputsServiceInstance = tsm.instance(mockedEngineOutputsService);

describe('With EngineOutputsController', () => {
    let controller: EngineOutputsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EngineOutputsController],
            providers: [
                {
                    provide: EngineOutputsService,
                    useValue: mockedEngineOutputsServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<EngineOutputsController>(EngineOutputsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedEngineOutputsService.findAll()).thenReturn(
            Promise.resolve(sampleEngineOutputs)
        );
        expect(await controller.findAll()).toEqual({
            engineOutputs: sampleEngineOutputs,
        } as GetEngineOutputsResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/engineOutputs' });
        const response = mock<Response>();

        const task = EngineOutputsTestUtils.mockEngineOutputWithId(
            '7'
        ) as CreateEngineOutputRequest;

        const taskId = mockEngineOutputsId();
        tsm.when(mockedEngineOutputsService.create(task)).thenReturn(Promise.resolve(taskId));

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedEngineOutputsService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/engineOutputs/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = EngineOutputsTestUtils.mockEngineOutputWithId('8');
        await controller.update(task.id, task);
        tsm.verify(mockedEngineOutputsService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = EngineOutputsTestUtils.mockEngineOutputWithId('8');
        tsm.when(mockedEngineOutputsService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as EngineOutput);
    });

    it('calls remove by ID', async () => {
        const taskId = mockEngineOutputsId();
        await controller.remove(taskId);
        tsm.verify(mockedEngineOutputsService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedEngineOutputsService.removeAll()).once();
    });
});
