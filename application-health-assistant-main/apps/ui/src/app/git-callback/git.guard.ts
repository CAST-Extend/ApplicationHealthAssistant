/* eslint-disable no-restricted-syntax */
/* eslint-disable jsdoc/require-returns */

/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

import environment from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GitGuard implements CanActivate {
    private clientId = environment.UI_GitHubClientId;

    private redirectUri = environment.UI_GitHubRedirectUri;

    username: string | null = '';

    /**
     *
     * @param http
     * @param router
     */
    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    /**
     *
     */
    login() {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=repo,write:org`;

        window.location.href = authUrl;
    }

    /**
     *
     * @param code
     */
    handleGitCallback(code: string): Observable<any> {
  return this.http.post<any>(`${environment.apiBaseUrl}gitauth`, { code }).pipe(
    tap((response) => {
      console.log('Response from backend:', response); // Debugging
      if (response && response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        this.router.navigate(['/']);
      } else {
        console.error('Access token not found in response');
      }
    }),
    catchError((error) => {
      console.error('Error during GitHub callback handling', error);
      throw error;
    })
  );
}

    /**
     *
     */

    /**
     *
     */
    isAuthenticated(): boolean {
        const accessToken = localStorage.getItem('access_token');
        return !!localStorage.getItem('access_token') && accessToken !== 'undefined';
    }

    /**
     *
     */

    /**
     *
     */
    logout() {
        sessionStorage.clear();
        localStorage.clear();
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const cookieName = cookie.split('=')[0].trim();
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
        this.router.navigate(['login']);
    }

    /**
     *
     * @param next
     * @param state
     */
    canActivate() // next: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot
    : boolean {
        if (this.isAuthenticated()) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
