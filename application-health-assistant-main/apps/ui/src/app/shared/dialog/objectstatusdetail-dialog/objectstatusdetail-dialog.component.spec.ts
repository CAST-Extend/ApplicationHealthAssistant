import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import ObjectstatusdetailDialogComponent from './objectstatusdetail-dialog.component';

describe('ObjectstatusdetailDialogComponent', () => {
    let component: ObjectstatusdetailDialogComponent;
    let fixture: ComponentFixture<ObjectstatusdetailDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ObjectstatusdetailDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ObjectstatusdetailDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
