import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreateEngineInputRequest,
    GetEngineInputsResponse,
    EngineInput,
} from '@application-health-assistant/shared-api-model/model/engineInputs';

import EngineInputsTestUtils from './EngineInputsTestUtils';
import EngineInputsController from './engineInputs.controller';
import EngineInputsService from './engineInputs.service';
import mockEngineInputsId from './mockEngineInputsId';
import sampleEngineInputs from './sampleEngineInputs';
import { EngineInput as DataModelTask } from './schemas/EngineInputs.schema';

const mockedEngineInputsService = tsm.mock(EngineInputsService);
const mockedEngineInputsServiceInstance = tsm.instance(mockedEngineInputsService);

describe('With EngineInputsController', () => {
    let controller: EngineInputsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EngineInputsController],
            providers: [
                {
                    provide: EngineInputsService,
                    useValue: mockedEngineInputsServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<EngineInputsController>(EngineInputsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedEngineInputsService.findAll()).thenReturn(
            Promise.resolve(sampleEngineInputs)
        );
        expect(await controller.findAll()).toEqual({
            engineInputs: sampleEngineInputs,
        } as GetEngineInputsResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/engineInputs' });
        const response = mock<Response>();

        const task = EngineInputsTestUtils.mockEngineInputWithId([]) as CreateEngineInputRequest;

        const taskId = mockEngineInputsId();
        tsm.when(mockedEngineInputsService.create(task)).thenReturn(Promise.resolve(taskId));

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedEngineInputsService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/engineInputs/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = EngineInputsTestUtils.mockEngineInputWithId([]);
        await controller.update(task.id, task);
        tsm.verify(mockedEngineInputsService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = EngineInputsTestUtils.mockEngineInputWithId([]);
        tsm.when(mockedEngineInputsService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as EngineInput);
    });

    it('calls remove by ID', async () => {
        const taskId = mockEngineInputsId();
        await controller.remove(taskId);
        tsm.verify(mockedEngineInputsService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedEngineInputsService.removeAll()).once();
    });
});
