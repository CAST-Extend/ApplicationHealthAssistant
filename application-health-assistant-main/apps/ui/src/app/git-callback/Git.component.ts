import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GitGuard } from './git.guard';

@Component({
    selector: 'polaris-git',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './Git.component.html',
    styleUrl: './Git.component.css',
})
/* eslint-disable import/prefer-default-export */
export class GitComponent {
    /**
     *
     * @param route
     * @param router
     * @param authService
     */
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: GitGuard
    ) {}

    /**
     *
     */
    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const { code } = params;
            if (code) {
                this.authService.handleGitCallback(code).subscribe(
                    () => {
                        this.router.navigate(['/home']);
                    },
                    () => {
                        // this.authService.login();
                    }
                );
            } else {
                this.authService.login();
            }
        });
    }
}
