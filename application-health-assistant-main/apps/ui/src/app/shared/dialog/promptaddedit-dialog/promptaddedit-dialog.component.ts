import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';

import DataService from '../../service/data.service';

@Component({
    selector: 'polaris-promptaddedit-dialog',
    templateUrl: './promptaddedit-dialog.component.html',
    styleUrl: './promptaddedit-dialog.component.scss',
})
export default class PromptaddeditDialogComponent {
    promptForm: FormGroup;

    spinnerDisplay = false;

    issueList: any;

    /**
     *
     * @param dialogRef
     * @param data
     * @param dialog
     * @param dataService
     * @param formBuilder
     */
    constructor(
        public dialogRef: MatDialogRef<PromptaddeditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
        this.promptForm = this.formBuilder.group({
            issueid: ['', Validators.required],
            technology: ['', Validators.required],
            prompt: ['', Validators.required],
        });
    }

    /**
     *
     */
    ngOnInit() {
        // bind issuelist dropdown
        this.dataService.getMasterIssueList().subscribe((res) => {
            this.issueList = res.issueDetails;
        });
        //   this.promptForm.patchValue(this.data);
        this.promptForm = this.formBuilder.group({
            issueid: [this.data?.issueid?.toString(), Validators.required],
            technology: [
                this.data?.technologies?.[this.data?.selectdTech]?.technology,
                Validators.required,
            ],
            prompt: [
                this.data?.technologies?.[this.data?.selectdTech]?.prompts[
                    this.data?.selectedPrompt
                ]?.prompt,
                Validators.required,
            ],
        });
        if (this.data) {
            this.promptForm.get('issueid')?.disable();
            this.promptForm.get('technology')?.disable();
        }
    }

    /**
     *
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /**
     *
     */
    onSubmit() {
        if (this.promptForm.valid) {
            if (this.data) {
                this.data.technologies[this.data.selectdTech].prompts[
                    this.data.selectedPrompt
                ].prompt = this.promptForm.value.prompt;
                delete this.data.selectdTech;
                delete this.data.selectedPrompt;
                this.dataService.updatePrompt(this.data.id, this.data).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                const selectedIssue = this.issueList.filter(
                    (item: any) => item.issueId === this.promptForm.value.issueid
                );
                const promptData = {
                    applicationid: null,
                    issueid: parseInt(this.promptForm.value.issueid, 10),
                    issuename: selectedIssue[0].issueTitle,
                    prompttype: 'generic',
                    technologies: [
                        {
                            technology: this.promptForm.value.technology,
                            prompts: [
                                {
                                    promptid: uuidv4(),
                                    prompt: this.promptForm.value.prompt,
                                },
                            ],
                        },
                    ],
                    type: 'Green Deficiency',
                    enabled: true,
                };
                this.dataService.addPromptToList(promptData).subscribe({
                    next: () => {
                        this.promptForm.reset();
                        this.dialogRef.close(true);
                    },
                });
            }
        }
    }
}
