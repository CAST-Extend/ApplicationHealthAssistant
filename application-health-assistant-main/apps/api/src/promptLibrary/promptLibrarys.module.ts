import { Module } from '@nestjs/common';

import MongoPromptLibraryRepository from './mongo/mongo-promptLibrarys.repository';
import PromptLibrarysController from './promptLibrarys.controller';
import PromptLibrarysService from './promptLibrarys.service';

@Module({
    controllers: [PromptLibrarysController],
    providers: [
        PromptLibrarysService,
        { provide: 'PromptLibraryRepository', useClass: MongoPromptLibraryRepository },
    ],
    exports: [PromptLibrarysService],
})
export default class PromptLibrarysModule {}
