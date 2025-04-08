/* eslint-disable import/prefer-default-export */
import { Controller, Post, Body } from '@nestjs/common';

import AllowControllerWithNoBearer from './common/allowControllerWithNoBearer';
import { GitAuthService } from './git-auth.service';

@AllowControllerWithNoBearer()
@Controller('/gitauth')
export class GitAuthController {
    /**
     *
     * @param authService
     */
    constructor(private readonly authService: GitAuthService) {}

    /**
     *
     * @param code
     */
    @Post()
    async gitCallback(@Body('code') code: string) {
        console.log(code);
        const tokenData = await this.authService.handleGitCallback(code);
        return tokenData;
    }
}
