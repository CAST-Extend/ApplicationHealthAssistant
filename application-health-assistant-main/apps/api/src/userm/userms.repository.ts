/* eslint-disable @typescript-eslint/no-empty-interface */

import { Userm } from '@application-health-assistant/shared-api-model/model/userms';

import { Repository } from '../repository/repository';

export interface UsermRepository extends Repository<Userm> {}
