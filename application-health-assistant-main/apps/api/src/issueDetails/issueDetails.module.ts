import { Module } from '@nestjs/common';

import IssueDetailsController from './issueDetails.controller';
import IssueDetailsService from './issueDetails.service';
import MongoIssueDetailRepository from './mongo/mongo-issueDetails.repository';

@Module({
    controllers: [IssueDetailsController],
    providers: [
        IssueDetailsService,
        { provide: 'IssueDetailRepository', useClass: MongoIssueDetailRepository },
    ],
    exports: [IssueDetailsService],
})
export default class IssueDetailsModule {}
