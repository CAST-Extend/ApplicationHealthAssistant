import { Module } from '@nestjs/common';

import EngineOutputsController from './engineOutputs.controller';
import EngineOutputsService from './engineOutputs.service';
import MongoEngineOutputRepository from './mongo/mongo-engineOutputs.repository';

@Module({
    controllers: [EngineOutputsController],
    providers: [
        EngineOutputsService,
        { provide: 'EngineOutputRepository', useClass: MongoEngineOutputRepository },
    ],
    exports: [EngineOutputsService],
})
export default class EngineOutputsModule {}
