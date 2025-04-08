import { Module } from '@nestjs/common';

import MongoPullRequestLogRepository from './mongo/mongo-pullRequestLogs.repository';
import PullRequestLogsController from './pullRequestLogs.controller';
import PullRequestLogsService from './pullRequestLogs.service';

@Module({
    controllers: [PullRequestLogsController],
    providers: [
        PullRequestLogsService,
        {
            provide: 'PullRequestLogRepository',
            useClass: MongoPullRequestLogRepository,
        },
    ],
    exports: [PullRequestLogsService],
})
export default class PullRequestLogsModule {}
