import { Module } from '@nestjs/common';

import MongoRetensionObjectDetailRepository from './mongo/mongo-retensionObjectDetails.repository';
import RetensionObjectDetailsController from './retensionObjectDetails.controller';
import RetensionObjectDetailsService from './retensionObjectDetails.service';

@Module({
    controllers: [RetensionObjectDetailsController],
    providers: [
        RetensionObjectDetailsService,
        {
            provide: 'RetensionObjectDetailRepository',
            useClass: MongoRetensionObjectDetailRepository,
        },
    ],
    exports: [RetensionObjectDetailsService],
})
export default class RetensionObjectDetailsModule {}
