import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import BasicActionDialogComponent from './basicaction-dialog.component';

describe('BasicActionDialogComponent', () => {
    let component: BasicActionDialogComponent;
    let fixture: ComponentFixture<BasicActionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [BasicActionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(BasicActionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
