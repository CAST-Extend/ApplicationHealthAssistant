import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Although this is a workaround for Cypress, it is advised to create a change order
// for service accounts that may login to Okta, and Cypress must go through Okta validation before testing the flow.
// import { isTestEnvironment } from '@application-health-assistant/shared-angular-utils/auth/auth.interceptor';

import InsightComponent from './features/insight/insight.component';
import LoginComponent from './features/login/login.component';
import MMCBrandComponent from './features/mmc-brand/mmc-brand.component';
import { GitComponent } from './git-callback/Git.component';
import { GitGuard } from './git-callback/git.guard';

export const routes: Routes = [
    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'apps',
    // },
    {
        path: '',
        component: LoginComponent,
        // canActivate: isTestEnvironment ? [] : [OktaAuthGuard],
        // canActivate: [GitGuard],
    },
    {
        path: 'home',
        loadChildren: () => import('./features/home/home.module').then((m) => m.default),
        canActivate: [GitGuard],
    },
    {
        path: 'home/:currentApp',
        loadChildren: () => import('./features/home/home.module').then((m) => m.default),
        canActivate: [GitGuard],
    },
    {
        path: 'apps/:currentApp',
        loadChildren: () => import('./features/home/home.module').then((m) => m.default),
        canActivate: [GitGuard],
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/dashboard/dashboard.module').then((m) => m.default),
        canActivate: [GitGuard],
    },
    {
        path: 'admin/prompt',
        loadChildren: () => import('./admin/prompt/prompt.module').then((m) => m.default),
        canActivate: [GitGuard],
    },
    {
        path: 'admin/usermanagement',
        loadChildren: () =>
            import('./admin/usermanagement/usermanagement.module').then((m) => m.default),
        canActivate: [GitGuard],
    },
    {
        path: 'mmc-brand',
        component: MMCBrandComponent,
    },
    {
        path: 'insight',
        component: InsightComponent,
        canActivate: [GitGuard],
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    // Map the callback route to the OktaCallbackComponent, which handles any tokens returned from the login process
    // { path: 'login/callback', component: OktaCallbackComponent },
    {
        path: 'auth/callback',
        component: GitComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export default class AppRoutingModule {}
