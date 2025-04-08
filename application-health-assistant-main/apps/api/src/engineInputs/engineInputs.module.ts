import { Module } from '@nestjs/common';

import EngineInputsController from './engineInputs.controller';
import EngineInputsService from './engineInputs.service';
import MongoEngineInputRepository from './mongo/mongo-engineInputs.repository';

@Module({
    controllers: [EngineInputsController],
    providers: [
        EngineInputsService,
        { provide: 'EngineInputRepository', useClass: MongoEngineInputRepository },
    ],
    exports: [EngineInputsService],
})
export default class EngineInputsModule {}
