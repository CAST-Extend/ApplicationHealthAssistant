/* eslint-disable @typescript-eslint/no-empty-interface */

import { FileContent } from '@application-health-assistant/shared-api-model/model/fileContents';

import { Repository } from '../repository/repository';

export interface FileContentRepository extends Repository<FileContent> {}
