import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { mock } from 'jest-mock-extended';
import * as tsm from 'ts-mockito';

import {
    CreateIssueDetailRequest,
    GetIssueDetailsResponse,
    IssueDetail,
} from '@application-health-assistant/shared-api-model/model/issueDetails';

import IssueDetailsTestUtils from './IssueDetailsTestUtils';
import IssueDetailsController from './issueDetails.controller';
import IssueDetailsService from './issueDetails.service';
import mockIssueDetailsId from './mockIssueDetailsId';
import sampleIssueDetails from './sampleIssueDetails';
import { IssueDetail as DataModelTask } from './schemas/IssueDetails.schema';

const mockedIssueDetailsService = tsm.mock(IssueDetailsService);
const mockedIssueDetailsServiceInstance = tsm.instance(mockedIssueDetailsService);

describe('With IssueDetailsController', () => {
    let controller: IssueDetailsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IssueDetailsController],
            providers: [
                {
                    provide: IssueDetailsService,
                    useValue: mockedIssueDetailsServiceInstance,
                },
            ],
        }).compile();

        controller = module.get<IssueDetailsController>(IssueDetailsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('calls findAll', async () => {
        tsm.when(mockedIssueDetailsService.findAll()).thenReturn(
            Promise.resolve(sampleIssueDetails)
        );
        expect(await controller.findAll()).toEqual({
            issueDetails: sampleIssueDetails,
        } as GetIssueDetailsResponse);
    });

    it('calls create', async () => {
        // Given
        const request = mock<Request>({ url: '/api/issueDetails' });
        const response = mock<Response>();

        const task = IssueDetailsTestUtils.mockIssueDetailWithId(1) as CreateIssueDetailRequest;

        const taskId = mockIssueDetailsId();
        tsm.when(mockedIssueDetailsService.create(task)).thenReturn(Promise.resolve(taskId));

        // When
        await controller.create(request, response, task);

        // Then
        tsm.verify(mockedIssueDetailsService.create(task)).once();
        expect(response.location).toHaveBeenCalledWith(`/api/issueDetails/${taskId}`);
        expect(response.send).toHaveBeenCalledTimes(1);
    });

    it('calls update', async () => {
        const task = IssueDetailsTestUtils.mockIssueDetailWithId(1);
        await controller.update(task.id, task);
        tsm.verify(mockedIssueDetailsService.update(task.id, task)).once();
    });

    it('calls findOne', async () => {
        const task = IssueDetailsTestUtils.mockIssueDetailWithId(1);
        tsm.when(mockedIssueDetailsService.findOne(task.id)).thenReturn(
            Promise.resolve(task as DataModelTask)
        );
        expect(await controller.findOne(task.id)).toEqual({ ...task } as IssueDetail);
    });

    it('calls remove by ID', async () => {
        const taskId = mockIssueDetailsId();
        await controller.remove(taskId);
        tsm.verify(mockedIssueDetailsService.remove(taskId)).once();
    });

    it('calls removeAll', async () => {
        await controller.removeAll();
        tsm.verify(mockedIssueDetailsService.removeAll()).once();
    });
});
