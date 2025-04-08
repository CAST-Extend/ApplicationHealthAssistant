import { Module } from '@nestjs/common';

import FeedbacksController from './feedbacks.controller';
import FeedbacksService from './feedbacks.service';
import MongoFeedbackRepository from './mongo/mongo-feedbacks.repository';
import EmailService from '../app/common/EmailService';

@Module({
    controllers: [FeedbacksController],
    providers: [
        FeedbacksService,
        {
            provide: 'FeedbackRepository',
            useClass: MongoFeedbackRepository,
        },
        EmailService,
    ],
    exports: [FeedbacksService],
})
export default class FeedbacksModule {}
