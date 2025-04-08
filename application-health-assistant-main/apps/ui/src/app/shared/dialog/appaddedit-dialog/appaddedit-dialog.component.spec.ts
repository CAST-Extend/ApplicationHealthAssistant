import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import AppaddeditDialogComponent from './appaddedit-dialog.component';

describe('AppaddeditDialogComponent', () => {
    let component: AppaddeditDialogComponent;
    let fixture: ComponentFixture<AppaddeditDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [AppaddeditDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppaddeditDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
