import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import ApplicationDtlsController from './applicationDtls.controller';
import ApplicationDtlsService from './applicationDtls.service';
import MongoApplicationDtlRepository from './mongo/mongo-applicationDtls.repository';

@Module({
    controllers: [ApplicationDtlsController],
    imports: [HttpModule],
    providers: [
        ApplicationDtlsService,
        { provide: 'ApplicationDtlRepository', useClass: MongoApplicationDtlRepository },
    ],
    exports: [ApplicationDtlsService],
})
export default class ApplicationDtlsModule {}
