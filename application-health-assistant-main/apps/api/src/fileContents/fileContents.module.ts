import { Module } from '@nestjs/common';

import FileContentsController from './fileContents.controller';
import FileContentsService from './fileContents.service';
import MongoFileContentRepository from './mongo/mongo-fileContents.repository';

@Module({
    controllers: [FileContentsController],
    providers: [
        FileContentsService,
        { provide: 'FileContentRepository', useClass: MongoFileContentRepository },
    ],
    exports: [FileContentsService],
})
export default class FileContentsModule {}
