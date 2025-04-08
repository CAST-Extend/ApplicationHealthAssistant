/* eslint-disable @typescript-eslint/no-empty-interface */

import { EngineInput } from '@application-health-assistant/shared-api-model/model/engineInputs';

import { Repository } from '../repository/repository';

export interface EngineInputRepository extends Repository<EngineInput> {}
