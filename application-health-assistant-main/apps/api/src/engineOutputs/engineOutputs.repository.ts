/* eslint-disable @typescript-eslint/no-empty-interface */

import { EngineOutput } from '@application-health-assistant/shared-api-model/model/engineOutputs';

import { Repository } from '../repository/repository';

export interface EngineOutputRepository extends Repository<EngineOutput> {}
