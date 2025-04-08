import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';
import DataService from '../../service/data.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'polaris-appaddedit-dialog',
    templateUrl: './appaddedit-dialog.component.html',
    styleUrls: ['./appaddedit-dialog.component.scss']
})
export default class AppaddeditDialogComponent implements OnInit {
    empForm: FormGroup;
    spinnerDisplay = false;
    showError = false;
    errorMsg = '';
    formType = true;
    castAppNameErrorHandler!: { isError: boolean; errorMessage: string };
    availableApps: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<AppaddeditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private dataService: DataService,
        private formBuilder: FormBuilder
    ) {
        dialogRef.disableClose = true;
        this.empForm = this.formBuilder.group({
			CAST_AppName: ['', Validators.required],
			Repository: ['', [Validators.required, Validators.pattern('https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+')]], 
			CastHlOnboard: [''],
			AhaOnboard: ['', Validators.required],
			SSP_AppName: [''],
			CastKey: [''],
			ProductCode: ['']
		});

    }

    ngOnInit() {
        this.formType = Array.isArray(this.data);
        
        if (!this.formType) {
            // Edit mode - populate form with existing data
            this.empForm.patchValue(this.data);
        } else {
            // Add mode - load available apps from API
            this.loadAvailableApps();
        }
    }

    loadAvailableApps() {
    this.spinnerDisplay = true;
    this.errorMsg = '';
    this.showError = false;

    // Fetch existing apps from MongoDB
    this.dataService.getAllowedProject().subscribe({
        next: (existingApps: any[]) => {
			console.log("Existing Apps (Raw Response):", JSON.stringify(existingApps, null, 2))
            const applicationDtls = existingApps[0]?.applicationDtls || [];
			console.log("Existing Apps",existingApps);
			if (!Array.isArray(applicationDtls)) {
            console.error("Expected an array in applicationDtls, but got:", applicationDtls);
            return;
			}
			// Extract CAST_AppName correctly
			const existingAppNames = applicationDtls.map(app => app?.CAST_AppName ?? 'Unknown');
			console.log("Extracted App Names:", existingAppNames);
            // Fetch all available apps
            this.dataService.getAvailableApps().subscribe({
                next: (apps: any[]) => {
					console.log('Apps received:', apps);
				
                    // Filter apps that are NOT in MongoDB
                    this.availableApps = apps.filter(app => 
                        !existingAppNames.includes(app.name)
                    );
					console.log("Available Apps",this.availableApps);
                    this.spinnerDisplay = false;
                },
                error: (error: HttpErrorResponse) => {
                    console.error('Error loading apps:', error);
                    this.spinnerDisplay = false;
                    this.errorMsg = 'Failed to load applications. Please try again later.';
                    this.showError = true;
                }
            });
        },
        error: (error: HttpErrorResponse) => {
            console.error('Error loading existing apps from Mongo:', error);
            this.spinnerDisplay = false;
            this.errorMsg = 'Failed to check existing applications. Please try again later.';
            this.showError = true;
        }
    });
}

    onAppSelected(event: any) {
        const selectedAppName = event.value;
        this.clearForm();
        
        // Auto-populate other fields based on selected app
        this.empForm.patchValue({
            CastKey: selectedAppName,
            ProductCode: selectedAppName,
            SSP_AppName: this.formatDisplayName(selectedAppName),
            Repository: this.getRepoNameFromAppName(selectedAppName),
            CastHlOnboard: 'true',
            AhaOnboard: 'true'
        });

        // Validate the app
        this.castAppNameErrorHandler = this.validateCastAppName(selectedAppName);
        if (this.castAppNameErrorHandler.isError) {
            this.showError = true;
        }
    }

    formatDisplayName(appName: string): string {
        // Convert "MER_-_METRIXEU_-_Metrix_EU" to "MER - METRIXEU - Metrix EU"
        return appName.replace(/_/g, ' ');
    }

    getRepoNameFromAppName(appName: string): string {
        // Extract repo name from app name
        // Example: "MER_-_METRIXEU_-_Metrix_EU" → "metrix-eu"
        const parts = appName.split('_').filter(part => part.trim() !== '');
        return parts.length > 2 ? parts[2].toLowerCase().replace(/\s+/g, '-') : '';
    }

    validateCastAppName(appName: string): { isError: boolean; errorMessage: string } {
        if (!appName) {
            return {
                isError: true,
                errorMessage: 'Please select an application'
            };
        }
        return {
            isError: false,
            errorMessage: ''
        };
    }

    onSubmit() {
    if (this.empForm.invalid) {
        this.showError = true;
        this.errorMsg = 'Please fix form errors before submitting.';
        return;
    }

    const formData = {
        ...this.empForm.value,
        CastKey: this.empForm.value.CAST_AppName,
        ProductCode: this.empForm.value.CAST_AppName,
        SSP_AppName: this.formatDisplayName(this.empForm.value.CAST_AppName)
    };

    if (!this.formType) {
        // Update existing application
        this.dataService.updateProject(this.data.id, formData).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => {
                console.error('Update failed:', err);
                this.errorMsg = 'Failed to update application';
                this.showError = true;
            }
        });
    } else {
        // Add new application
        this.dataService.addproject(formData).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => {
                console.error('Add failed:', err);
                this.errorMsg = 'Failed to add application';
                this.showError = true;
            }
        });
    }
}


    clearForm() {
        this.empForm.patchValue({
            SSP_AppName: '',
            ProductCode: '',
            Repository: '',
            CastHlOnboard: '',
            AhaOnboard: ''
        });
        this.showError = false;
        this.errorMsg = '';
    }

    closeDialog() {
        this.dialogRef.close();
    }
}