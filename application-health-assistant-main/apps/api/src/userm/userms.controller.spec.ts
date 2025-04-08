import { Test, TestingModule } from '@nestjs/testing';
// import { Request, Response } from 'express';
// import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

/*
import {
    CreateUsermRequest,
    GetUsermsResponse,
    Userm,
} from '@application-health-assistant/shared-api-model/model/userms';
*/
import UsermsController from './userms.controller';
import UsermsService from './userms.service';
/* import UsermsTestUtils from './usermsTestUtils';
import mockUsermsId from './mockUsermsId';
import sampleUserms from './sampleUserms';
import { Userm as DataModelTask } from './schemas/Userms.schema';
*/
const mockedUsermsService = tsm.mock(UsermsService);
const mockedFeedbacksServiceInstance = tsm.instance(mockedUsermsService);

describe('With UsermsController', () => {
    let controller: UsermsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsermsController],
            providers: [
                {
                    provide: UsermsService,
                    useValue: mockedFeedbacksServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<UsermsController>(UsermsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    /*
    it('calls findAll', async () => {
        tsm.when(mockedFeedbacksService.findAll()).thenReturn(Promise.resolve(sampleFeedbacks));
        expect(await controller.findAll()).toEqual({
            feedbacks: sampleFeedbacks,
        } as GetUsermsResponse);
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
    }); */
});
