import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrl: './alert-dialog.component.scss',
})
export default class AlertDialogComponent {
    error: any;

    /**
     *
     * @param data
     * @param dialogRef
     * @param dialog
     */
    constructor(
        public dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
    }
    /*  constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<AlertDialogComponent>
    ) {} */

    /**
     *
     */
    closeDialog() {
        this.dialogRef.close();
    }
}
