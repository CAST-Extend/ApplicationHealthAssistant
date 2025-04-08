/* eslint-disable @typescript-eslint/no-empty-interface */

import { IssueDetail } from '@application-health-assistant/shared-api-model/model/issueDetails';

import { Repository } from '../repository/repository';

export interface IssueDetailRepository extends Repository<IssueDetail> {}
