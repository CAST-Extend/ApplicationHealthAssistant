import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { delay, OktaAuth, TokenManagerError } from '@okta/okta-auth-js';

import AngularUtilsModule from '@application-health-assistant/shared-angular-utils/angular-utils.module';
import AuthInterceptor from '@application-health-assistant/shared-angular-utils/auth/auth.interceptor';
import HttpRetryConfig from '@application-health-assistant/shared-angular-utils/http-resilient/http-retry.config';
import HttpRetryInterceptor from '@application-health-assistant/shared-angular-utils/http-resilient/http-retry.interceptor';

import AppRoutingModule from './app-routing.module';
import AppComponent from './app.component';
import environment from '../environments/environment';
import InsightComponent from './features/insight/insight.component';
import LoginComponent from './features/login/login.component';
import OktaCallbackComponent from './okta-callback/okta-callback.component';
import AlertDialogComponent from './shared/dialog/alert-dialog/alert-dialog.component';
import AppaddeditDialogComponent from './shared/dialog/appaddedit-dialog/appaddedit-dialog.component';
import BasicActionDialogComponent from './shared/dialog/basicaction-dialog/basicaction-dialog.component';
import FeedbackDialogComponent from './shared/dialog/feedback-dialog/feedback-dialog.component';
import ObjectstatusdetailDialogComponent from './shared/dialog/objectstatusdetail-dialog/objectstatusdetail-dialog.component';
import { ObjselectionDialogComponent } from './shared/dialog/objselection-dialog/objselection-dialog.component';
import PromptDialogComponent from './shared/dialog/prompt-dialog/prompt-dialog.component';
import PromptaddeditDialogComponent from './shared/dialog/promptaddedit-dialog/promptaddedit-dialog.component';
import { StatusdetailDialogComponent } from './shared/dialog/statusdetail-dialog/statusdetail-dialog.component';
import UserManagementaddeditDialogComponent from './shared/dialog/usermanagementaddedit-dialog/usermanagementaddedit-dialog.component';
import SharedModule from './shared/shared.module';

const oktaAuth = new OktaAuth(environment.oktaConfig);

// Resolves a known issue with Okta by initiating a new login flow.
// Stale/Invalid sessions resulting in OAuthError "The client specified not to prompt, but the user isn't signed in."
oktaAuth.tokenManager.on('error', async (err: TokenManagerError) => {
    if (err.errorCode === 'login_required') {
        console.log('OAuthError: Caught known error with Okta sessions');
        console.log(err.message);
        await delay(1_000);
        oktaAuth.signInWithRedirect();
    }
});

@NgModule({
    declarations: [
        AppComponent,
        OktaCallbackComponent,
        InsightComponent,
        AlertDialogComponent,
        PromptDialogComponent,
        ObjselectionDialogComponent,
        StatusdetailDialogComponent,
        AppaddeditDialogComponent,
        PromptaddeditDialogComponent,
        ObjectstatusdetailDialogComponent,
        FeedbackDialogComponent,
        LoginComponent,
        UserManagementaddeditDialogComponent,
        BasicActionDialogComponent,
    ],
    bootstrap: [AppComponent],
    imports: [
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        OktaAuthModule,
        SharedModule,
        AngularUtilsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatFormField,
        MatIconModule,
        MatLabel,
        MatInputModule,
        AngularUtilsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatTableModule,
        MatStepperModule,
        MatTooltipModule,
        MatOptionModule,
        MatRadioModule,
        MatSelectModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatIconModule,
    ],
    providers: [
        { provide: OKTA_CONFIG, useValue: { oktaAuth } },
        { provide: HttpRetryInterceptor },
        { provide: HttpRetryInterceptor.HTTP_RETRY_CONFIG, useValue: HttpRetryConfig },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export default class AppModule {}
