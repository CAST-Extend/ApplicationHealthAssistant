import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import EmailController from './EmailController';
import EmailService from './EmailService';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [EmailController],
    providers: [EmailService],
})
export default class EmailModule {}
