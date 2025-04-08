/* eslint-disable class-methods-use-this */

import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import DataService from '../../service/data.service';
// import PromptDialogComponent from '../prompt-dialog/prompt-dialog.component';

@Component({
    selector: 'polaris-statusdetail-dialog',
    templateUrl: './objectstatusdetail-dialog.component.html',
    styleUrl: './objectstatusdetail-dialog.component.scss',
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { displayDefaultIndicatorType: false },
        },
    ],
})
export default class ObjectstatusdetailDialogComponent implements OnInit {
    spinnerDisplay = false;

    objReqCount = 0;

    displayedColumns: string[] = ['objectid', 'filefullname', 'type'];

    displayedColumnsStatus: string[] = ['objectid', 'status', 'message'];

    /**
     *
     * @param dialogRef
     * @param data
     * @param getObjDetails
     * @param status
     * @param dialog
     * @param dataService
     */
    constructor(
        public dialogRef: MatDialogRef<ObjectstatusdetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public getObjDetails: any,
        @Inject(MAT_DIALOG_DATA) public status: any,
        public dialog: MatDialog,
        private dataService: DataService
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
    }

    /**
     *
     */
    ngOnInit() {
        // console.log(this.getObjDetails);
    }

    /**
     *
     */
    ngOnDestroy() {}

    /**
     *
     */
    closeDialog() {
        this.dialogRef.close();
    }
}
