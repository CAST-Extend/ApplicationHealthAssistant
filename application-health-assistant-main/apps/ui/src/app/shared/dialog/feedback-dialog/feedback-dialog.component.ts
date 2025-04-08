import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import DataService from '../../service/data.service';
import AlertDialogComponent from '../alert-dialog/alert-dialog.component';

@Component({
    selector: 'app-feedback-dialog',
    templateUrl: './feedback-dialog.component.html',
    styleUrl: './feedback-dialog.component.scss',
})
export default class FeedbackDialogComponent {
    error: any;

    feedbackForm: FormGroup;

    rating = 0; // Initialize rating

    hoverRating = 0;

    spinnerDisplay = false;

    /**
     *
     * @param dialogRef
     * @param data
     * @param dialog
     * @param dataService
     * @param formBuilder
     * @param fb
     */
    // constructor(
    //     public dialogRef: MatDialogRef<FeedbackDialogComponent>,
    //     @Inject(MAT_DIALOG_DATA) public data: any,
    //     public dialog: MatDialog
    // ) {
    //     // eslint-disable-next-line no-param-reassign
    //     dialogRef.disableClose = true;
    // }

    constructor(
        public dialogRef: MatDialogRef<FeedbackDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private dataService: DataService,
        private formBuilder: FormBuilder,
        private fb: FormBuilder
    ) {
        // eslint-disable-next-line no-param-reassign
        dialogRef.disableClose = true;
        this.feedbackForm = this.formBuilder.group({
            // feedback_title: ['', Validators.required],
            feedback_description: ['', Validators.required],
        });
    }
    /*  constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<FeedbackDialogComponent>
    ) {} */

    /**
     *
     */
    ngOnInit() {
        this.rating = 0;
    }

    /**
     *
     * @param value
     */
    setRating(value: number) {
        this.rating = value; // Set the rating based on user selection
    }

    /**
     *
     * @param rating
     */
    setHoverRating(rating: number) {
        this.hoverRating = rating;
    }

    /**
     *
     */
    clearHoverRating() {
        this.hoverRating = 0;
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
        if (this.feedbackForm.valid) {
            //  this.feedbackForm.value.id = this.data?.id;
            const arrfeedbacklogdata = [
                {
                    // feedback_title: this.feedbackForm.value.feedback_title,
                    feedback_description: this.feedbackForm.value.feedback_description,
                    username: localStorage.getItem('currentUser'),
                    Customer_rating: this.rating,
                    createddate: new Date(),
                },
            ];
            this.dataService.postfeedbackdata(arrfeedbacklogdata[0]).subscribe((val: any) => {
                this.dialog.open(AlertDialogComponent, {
                    width: '400px',
                    // enterAnimationDuration,
                    // exitAnimationDuration,
                    data: { message: 'Thanks for submitting your feedback..' },
                });
                console.log(val);
                this.dialogRef.close(true);
            });
        } else {
            let response: string;
            if (this.feedbackForm.value.feedback_description === '') {
                response = 'Please fill required field...'; // 'Please Provide the description.';
                this.dialog.open(AlertDialogComponent, {
                    width: '400px',
                    // enterAnimationDuration,
                    // exitAnimationDuration,
                    data: { message: response },
                });
            }
        }
    }
}
