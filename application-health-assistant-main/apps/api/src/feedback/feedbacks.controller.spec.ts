import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreateFeedbackRequest,
    GetFeedbacksResponse,
    Feedback,
} from '@application-health-assistant/shared-api-model/model/feedbacks';

import FeedbacksController from './feedbacks.controller';
import FeedbacksService from './feedbacks.service';
import FeedbacksTestUtils from './feedbacksTestUtils';
import mockFeedbacksId from './mockFeedbacksId';
import sampleFeedbacks from './sampleFeedbacks';
import { Feedback as DataModelTask } from './schemas/Feedbacks.schema';

const mockedFeedbacksService = tsm.mock(FeedbacksService);
const mockedFeedbacksServiceInstance = tsm.instance(mockedFeedbacksService);

describe('With FeedbacksController', () => {
    let controller: FeedbacksController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeedbacksController],
            providers: [
                {
                    provide: FeedbacksService,
                    useValue: mockedFeedbacksServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<FeedbacksController>(FeedbacksController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedFeedbacksService.findAll()).thenReturn(Promise.resolve(sampleFeedbacks));
        expect(await controller.findAll()).toEqual({
            feedbacks: sampleFeedbacks,
        } as GetFeedbacksResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/feedbacks' });
        const response = mock<Response>();

        const task = FeedbacksTestUtils.mockFeedbackWithId('8') as CreateFeedbackRequest;

        const taskId = mockFeedbacksId();
        tsm.when(mockedFeedbacksService.create(task)).thenReturn(Promise.resolve(taskId));

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedFeedbacksService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/feedbacks/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = FeedbacksTestUtils.mockFeedbackWithId('8');
        await controller.update(task.id, task);
        tsm.verify(mockedFeedbacksService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = FeedbacksTestUtils.mockFeedbackWithId('8');
        tsm.when(mockedFeedbacksService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as Feedback);
    });

    it('calls remove by ID', async () => {
        const taskId = mockFeedbacksId();
        await controller.remove(taskId);
        tsm.verify(mockedFeedbacksService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedFeedbacksService.removeAll()).once();
    });
});
