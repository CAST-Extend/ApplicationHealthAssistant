import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { StatusdetailDialogComponent } from './statusdetail-dialog.component';

describe('StatusdetailDialogComponent', () => {
    let component: StatusdetailDialogComponent;
    let fixture: ComponentFixture<StatusdetailDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [StatusdetailDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(StatusdetailDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
