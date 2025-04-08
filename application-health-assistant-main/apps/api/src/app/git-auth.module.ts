/* eslint-disable import/prefer-default-export */
// auth.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GitAuthController } from './git-auth.controller';
import { GitAuthService } from './git-auth.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [GitAuthController],
    providers: [GitAuthService],
})
export class GitAuthModule {}
