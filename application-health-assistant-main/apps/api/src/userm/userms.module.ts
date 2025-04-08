import { Module } from '@nestjs/common';

import MongoUsermRepository from './mongo/mongo-userms.repository';
import UsermsController from './userms.controller';
import UsermsService from './userms.service';

@Module({
    controllers: [UsermsController],
    providers: [
        UsermsService,
        {
            provide: 'UsermRepository',
            useClass: MongoUsermRepository,
        },
    ],
    exports: [UsermsService],
})
export default class UsermsModule {}
