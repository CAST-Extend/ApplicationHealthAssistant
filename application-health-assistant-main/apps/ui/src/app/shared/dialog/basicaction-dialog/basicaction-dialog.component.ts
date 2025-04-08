import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-basicaction-dialog',
    templateUrl: './basicaction-dialog.component.html',
    styleUrl: './basicaction-dialog.component.scss',
})
export default class BasicActionDialogComponent {
    error: any;

    /**
     *
     * @param data
     * @param dialogRef
     * @param dialog
     */
    constructor(
        public dialogRef: MatDialogRef<BasicActionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
    }

    /**
     *
     */
    // eslint-disable-next-line class-methods-use-this
    ngOnInit() {}

    /**
     *
     */
    onPerformAction() {
        if (this.data.content.action) {
            (this.data.content.action as Observable<any>).subscribe((response: any) => {
                console.log(response);
                this.closeDialog('close_on_success');
            });
        } else {
            this.closeDialog('close_by_no_action_found');
        }
    }

    /**
     *
     */
    onDismissDialog() {
        this.closeDialog('close_by_click_cancel');
    }

    /**
     *
     * @param action
     */
    closeDialog(action: string) {
        this.dialogRef.close(action);
    }
}
