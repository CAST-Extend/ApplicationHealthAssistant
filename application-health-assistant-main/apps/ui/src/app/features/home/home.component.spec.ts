import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OktaAuthStateService, OKTA_CONFIG } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

import HomeComponent from './home.component';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [HomeComponent],
            providers: [
                provideRouter([]),
                { provide: OktaAuth, useValue: {} },
                { provide: OktaAuthStateService, useValue: {} },
                { provide: OKTA_CONFIG, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
