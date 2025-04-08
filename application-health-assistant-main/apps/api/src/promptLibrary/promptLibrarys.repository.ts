/* eslint-disable @typescript-eslint/no-empty-interface */

import { PromptLibrary } from '@application-health-assistant/shared-api-model/model/promptLibrarys';

import { Repository } from '../repository/repository';

export interface PromptLibraryRepository extends Repository<PromptLibrary> {}
