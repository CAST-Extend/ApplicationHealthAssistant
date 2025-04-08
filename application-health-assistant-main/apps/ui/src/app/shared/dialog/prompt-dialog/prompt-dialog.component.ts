import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import DataService from '../../service/data.service';
import AlertDialogComponent from '../alert-dialog/alert-dialog.component';

@Component({
    selector: 'polaris-prompt-dialog',
    templateUrl: './prompt-dialog.component.html',
    styleUrl: './prompt-dialog.component.scss',
})
export default class PromptDialogComponent {
    /**
     *
     * @param dialogRef
     * @param data
     * @param dialog
     * @param dataService
     */
    constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private dataService: DataService
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
    }

    selectedPrompt: any;

    promptList$: Array<object> = [];

    displayedColumns: string[] = ['promptid', 'prompt', 'language'];

    spinnerDisplay = false;

    promptDetail: any;

    /**
     *
     */
    ngOnInit() {
        this.spinnerDisplay = true;
        this.dataService.getPromptAgainstIssue(this.data?.issueId).subscribe(
            (response: any) => {
                const unique = [...new Set(this.data?.objList?.map((obj: any) => obj.type))];
                // console.log(unique);
                unique?.forEach((language: any) => {
                    this.promptDetail = response.promptLibrarys[0]?.technologies?.find(
                        (o: any) =>
                            o.technology.toLowerCase() === language.split(' ')[0].toLowerCase()
                    );
                    if (this.promptDetail && this.promptDetail.prompts.length > 0) {
                        this.promptList$ = [this.promptDetail.prompts];
                        this.selectedPrompt = this.promptDetail.prompts[0]?.promptid;
                    } else {
                        const subject = 'Prompt not available';
                        const message = `Prompt not available for:\nLanguage:${language}\nIssue:${this.data?.issueId}\n\n Regards,\nAHA Support`;
                        this.dataService.sendEmail(subject, message);
                    }
                });
                this.spinnerDisplay = false;
            },
            () => {
                this.spinnerDisplay = false;
            }
        );
    }

    /**
     *
     * @param promptid
     */
    radioSelected(promptid: string) {
        this.selectedPrompt = promptid;
    }

    /**
     *
     */
    fix() {
        const selectedPromptDetail = {
            promptid: this.selectedPrompt,
            selected: true,
        };
        localStorage.removeItem('issueid');
        localStorage.setItem('issueid', this.data?.issueId);
        this.dialogRef.close(selectedPromptDetail);
    }

    /**
     *
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /**
     *
     * @param status
     * @param enterAnimationDuration
     * @param exitAnimationDuration
     */
    openDialog(status: any, enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: '400px',
            enterAnimationDuration,
            exitAnimationDuration,
            data: status,
        });
    }
}
