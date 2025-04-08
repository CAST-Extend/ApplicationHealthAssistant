import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OktaAuthStateService, OKTA_CONFIG } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

import PromptComponent from './prompt.component';

describe('PromptComponent', () => {
    let component: PromptComponent;
    let fixture: ComponentFixture<PromptComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [PromptComponent],
            providers: [
                provideRouter([]),
                { provide: OktaAuth, useValue: {} },
                { provide: OktaAuthStateService, useValue: {} },
                { provide: OKTA_CONFIG, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PromptComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
