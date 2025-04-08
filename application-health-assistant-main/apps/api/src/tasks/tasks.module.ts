import { Module } from '@nestjs/common';

import MongoTaskRepository from './mongo/mongo-task.repository';
import TasksController from './tasks.controller';
import TasksService from './tasks.service';

@Module({
    controllers: [TasksController],
    providers: [TasksService, { provide: 'TaskRepository', useClass: MongoTaskRepository }],
    exports: [TasksService],
})
export default class TasksModule {}
