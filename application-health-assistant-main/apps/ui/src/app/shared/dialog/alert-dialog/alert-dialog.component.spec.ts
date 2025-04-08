import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import AlertDialogComponent from './alert-dialog.component';

describe('AlertDialogComponent', () => {
    let component: AlertDialogComponent;
    let fixture: ComponentFixture<AlertDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [AlertDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AlertDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
