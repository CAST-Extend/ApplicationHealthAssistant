import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OktaAuthStateService, OKTA_CONFIG } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

import UsermanagementComponent from './usermanagement.component';

describe('usermanagement', () => {
    let component: UsermanagementComponent;
    let fixture: ComponentFixture<UsermanagementComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [UsermanagementComponent],
            providers: [
                provideRouter([]),
                { provide: OktaAuth, useValue: {} },
                { provide: OktaAuthStateService, useValue: {} },
                { provide: OKTA_CONFIG, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UsermanagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
