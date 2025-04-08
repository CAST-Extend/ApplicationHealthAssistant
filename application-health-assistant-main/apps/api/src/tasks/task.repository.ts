/* eslint-disable @typescript-eslint/no-empty-interface */

import { Task } from '@application-health-assistant/shared-api-model/model/tasks';

import { Repository } from '../repository/repository';

export interface TaskRepository extends Repository<Task> {}
