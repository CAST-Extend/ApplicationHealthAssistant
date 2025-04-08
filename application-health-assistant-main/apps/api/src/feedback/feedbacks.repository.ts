/* eslint-disable @typescript-eslint/no-empty-interface */

import { Feedback } from '@application-health-assistant/shared-api-model/model/feedbacks';

import { Repository } from '../repository/repository';

export interface FeedbackRepository extends Repository<Feedback> {}
