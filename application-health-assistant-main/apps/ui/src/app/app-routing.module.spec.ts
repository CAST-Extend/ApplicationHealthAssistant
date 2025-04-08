import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OktaAuthGuard, OktaAuthModule, OKTA_CONFIG } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import { routes } from './app-routing.module';
import AppComponent from './app.component';
import SharedModule from './shared/shared.module';
import environment from '../environments/environment';

// const API_NAME = 'api';
// const API_PORT = '8080';

describe('AppRoutingModule', () => {
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;
    // const apiBaseUrl = `http://localhost:${API_PORT}/${API_NAME}/v1`;

    beforeEach(async () => {
        const canActivateStub = () => ({ canActivate: () => true });
        const oktaAuth = new OktaAuth(environment.oktaConfig);
        await TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [
                RouterTestingModule.withRoutes(routes),
                OktaAuthModule,
                HttpClientTestingModule,
                SharedModule,
            ],
            providers: [
                { provide: OKTA_CONFIG, useValue: { oktaAuth } },
                { provide: OktaAuthGuard, useValue: canActivateStub },
            ],
        }).compileComponents();

        router = TestBed.inject(Router);
        router.initialNavigation();
        fixture = TestBed.createComponent(AppComponent);
    });
    it('should navigate to apps route', fakeAsync(() => {
        const route = router.config[0].path;
        router.navigateByUrl('');
        tick();
        fixture.detectChanges();
        expect(router.url).toBe('/');
        expect(route).toBe('');
    }));

    it('should load all the routes of the application', fakeAsync(() => {
        const routeLength = routes.length;
        expect(routeLength).toBe(11);
    }));
});
