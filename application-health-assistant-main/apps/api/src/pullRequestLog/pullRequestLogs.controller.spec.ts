import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreatePullRequestLogRequest,
    GetPullRequestLogsResponse,
    PullRequestLog,
} from '@application-health-assistant/shared-api-model/model/pullRequestLogs';

import mockPullRequestLogsId from './mockPullRequestLogsId';
import PullRequestLogsController from './pullRequestLogs.controller';
import PullRequestLogsService from './pullRequestLogs.service';
import PullRequestLogsTestUtils from './pullRequestLogsTestUtils';
import samplePullRequestLogs from './samplePullRequestLogs';
import { PullRequestLog as DataModelTask } from './schemas/PullRequestLogs.schema';

const mockedPullRequestLogsService = tsm.mock(PullRequestLogsService);
const mockedPullRequestLogsServiceInstance = tsm.instance(mockedPullRequestLogsService);

describe('With PullRequestLogsController', () => {
    let controller: PullRequestLogsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PullRequestLogsController],
            providers: [
                {
                    provide: PullRequestLogsService,
                    useValue: mockedPullRequestLogsServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<PullRequestLogsController>(PullRequestLogsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedPullRequestLogsService.findAll()).thenReturn(
            Promise.resolve(samplePullRequestLogs)
        );
        expect(await controller.findAll()).toEqual({
            pullRequestLogs: samplePullRequestLogs,
        } as GetPullRequestLogsResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/pullRequestLogs' });
        const response = mock<Response>();

        const task = PullRequestLogsTestUtils.mockPullRequestLogWithId(
            '8'
        ) as CreatePullRequestLogRequest;

        const taskId = mockPullRequestLogsId();
        tsm.when(mockedPullRequestLogsService.create(task)).thenReturn(Promise.resolve(taskId));

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedPullRequestLogsService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/pullRequestLogs/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = PullRequestLogsTestUtils.mockPullRequestLogWithId('8');
        await controller.update(task.id, task);
        tsm.verify(mockedPullRequestLogsService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = PullRequestLogsTestUtils.mockPullRequestLogWithId('8');
        tsm.when(mockedPullRequestLogsService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as PullRequestLog);
    });

    it('calls remove by ID', async () => {
        const taskId = mockPullRequestLogsId();
        await controller.remove(taskId);
        tsm.verify(mockedPullRequestLogsService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedPullRequestLogsService.removeAll()).once();
    });
});
