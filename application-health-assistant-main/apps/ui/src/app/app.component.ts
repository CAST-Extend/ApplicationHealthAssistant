import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GitGuard } from './git-callback/git.guard';
import environment from '../environments/environment';
import DataService from './shared/service/data.service';

@Component({
    selector: 'polaris-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export default class AppComponent implements OnInit {
    title = 'Application Health Assistant';

    appVersion = '';

    apiUnreachable = false;

    apiError = false;

    isMenuOpen = false;

    username: string | null = null;

    repos: any[] = [];

    spinnerDisplay = false;

    userAdminAccess = false;

    userSuperAdminAccess = false;

    /**
     *
     * @param injector
     * @param http
     * @param gitAuthService
     * @param router
     * @param dataService
     */
    constructor(
        public injector: Injector,
        private http: HttpClient,
        private gitAuthService: GitGuard,
        private router: Router,
        private dataService: DataService
    ) {
        // this.isAPILive();
        this.appVersion = environment.appVersion;
    }

    /**
     *
     */
    ngOnInit(): void {
        this.dataService.fetchUsername();

        this.dataService.getUsername.subscribe((username) => {
            if (username !== null && username !== '') {
                this.username = username;
                this.dataService.getUserAccessDetail(username).subscribe(
                    (val: any) => {
                        localStorage.setItem('accessLevel', val?.result?.userType);
                        if (
                            val?.result?.userType === 'admin' ||
                            val?.result?.userType === 'superAdmin'
                        ) {
                            this.userAdminAccess = true;
                        }
                        if (val?.result?.userType === 'superAdmin') {
                            this.userSuperAdminAccess = true;
                        }
                        this.spinnerDisplay = false;
                    },
                    () => {
                        this.spinnerDisplay = false;
                    }
                );
            }
        });
    }

    /**
     *
     */
    isLoginPage(): boolean {
        return this.router.url === '/login'; // Check if the current route is '/login'
    }

    /**
     * Check if API is up and running, updates the component state based on API response.
     */
    /*
    isAPILive(): void {
        const sub = this.http.get(`${environment.apiBaseUrl}/tasks`);
        sub.subscribe({
            next: () => {
                this.apiUnreachable = false;
                this.apiError = false;
            },
            error: (error) => {
                if (error.statusText === 'Unknown Error') this.apiUnreachable = true;
                if (error.statusText === 'Internal Server Error') this.apiError = true;
            },
        });
    }
    */
    /**
     * Toggle Menu for Responsive Design
     */
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    /**
     *
     */
    logout(): void {
        localStorage.removeItem('issueid');
        this.gitAuthService.logout();
    }
}
