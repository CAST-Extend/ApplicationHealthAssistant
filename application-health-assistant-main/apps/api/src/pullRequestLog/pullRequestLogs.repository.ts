/* eslint-disable @typescript-eslint/no-empty-interface */

import { PullRequestLog } from '@application-health-assistant/shared-api-model/model/pullRequestLogs';

import { Repository } from '../repository/repository';

export interface PullRequestLogRepository extends Repository<PullRequestLog> {}
