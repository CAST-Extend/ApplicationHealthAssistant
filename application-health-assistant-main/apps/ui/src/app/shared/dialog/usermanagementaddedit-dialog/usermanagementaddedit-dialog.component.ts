import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Octokit } from '@octokit/rest';
import { debounceTime } from 'rxjs/operators';

import DataService from '../../service/data.service';

@Component({
    selector: 'polaris-promptaddedit-dialog',
    templateUrl: './usermanagementaddedit-dialog.component.html',
    styleUrl: './usermanagementaddedit-dialog.component.scss',
})
export default class UsermanagementaddeditDialogComponent {
    userManagementForm: FormGroup;

    spinnerDisplay = false;

    userNameDisable = false;

    showError = false;

    errorMsg = '';

    formType = true;

    /**
     *
     * @param dialogRef
     * @param data
     * @param dialog
     * @param dataService
     * @param formBuilder
     */
    constructor(
        public dialogRef: MatDialogRef<UsermanagementaddeditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
        this.userManagementForm = this.formBuilder.group({
            userName: ['', Validators.required],
            userType: ['', Validators.required],
        });
    }

    /**
     *
     */
    ngOnInit() {
        // add form if array, edit form if object
        this.formType = Array.isArray(this.data);
        this.userManagementForm = this.formBuilder.group({
            userName: [this.data?.userName?.toString(), Validators.required],
            userType: [this.data?.userType?.toString(), Validators.required],
        });
        if (!this.formType) {
            this.userNameDisable = true;
        }
        this.userManagementForm
            .get('userName')
            ?.valueChanges.pipe(debounceTime(1000))
            .subscribe(async (userName: any) => {
                this.showError = false;
                const index = this.data?.findIndex(
                    (app: any) => app.userName.toLowerCase() === userName.toLowerCase()
                );
                if (index === -1) {
                    if (userName !== '' && userName !== null) {
                        this.spinnerDisplay = true;
                        const octokit = new Octokit({
                            auth: localStorage.getItem('access_token'),
                        });
                        try {
                            await octokit.request('GET /users/{username}', {
                                username: userName,
                            });
                            /* if (result !== null) {
                                this.userManagementForm.patchValue({
                                    userName,
                                });
                            } */
                            this.spinnerDisplay = false;
                        } catch (error: any) {
                            this.showError = true;
                            this.errorMsg = 'User is not available on Github.';
                            this.spinnerDisplay = false;
                        }
                    }
                } else {
                    this.errorMsg = 'User Name is already exist.';
                    this.showError = true;
                    this.spinnerDisplay = false;
                }
            });
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
        if (this.userManagementForm.valid) {
            if (!this.formType) {
                this.data.userName = this.userManagementForm.value.userName;
                this.data.userType = this.userManagementForm.value.userType;
                // delete this.data.selectdTech;
                // delete this.data.selectedPrompt;
                this.dataService.updateUser(this.data.id, this.data).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                const userData = {
                    userName: this.userManagementForm.value.userName,
                    userType: this.userManagementForm.value.userType,
                };
                this.dataService.addUser(userData).subscribe({
                    next: () => {
                        this.userManagementForm.reset();
                        this.dialogRef.close(true);
                    },
                });
            }
        }
    }
}
