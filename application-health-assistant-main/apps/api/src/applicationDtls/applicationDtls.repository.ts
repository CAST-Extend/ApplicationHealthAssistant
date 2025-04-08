/* eslint-disable @typescript-eslint/no-empty-interface */

import { ApplicationDtl } from '@application-health-assistant/shared-api-model/model/applicationDtls';

import { Repository } from '../repository/repository';

export interface ApplicationDtlRepository extends Repository<ApplicationDtl> {}
