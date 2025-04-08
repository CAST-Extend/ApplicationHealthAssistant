/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OktaAuthStateService } from '@okta/okta-angular';

import AlertDialogComponent from '../../shared/dialog/alert-dialog/alert-dialog.component';
import PromptaddeditDialogComponent from '../../shared/dialog/promptaddedit-dialog/promptaddedit-dialog.component';
import DataStateService from '../../shared/service/data-state.service';
import DataService from '../../shared/service/data.service';

@Component({
    selector: 'polaris-prompt',
    templateUrl: './prompt.component.html',
    styleUrls: ['./prompt.component.scss'],
})
export default class PromptComponent implements OnInit {
    spinnerDisplay = false;

    displayedColumns: string[] = ['issuename', 'technologies', 'prompt', 'action'];

    arrayFilter: any;

    // employee list will be assigned to this and it is passed as the data source to the mat-table in the HTML template
    dataSource!: MatTableDataSource<any>;

    // @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild(MatSort) sort!: MatSort;

    /**
     * @param {OktaAuthStateService} authStateService - service that provides the current state of the Okta authentication
     * @param {Injector} injector - service that provides the OktaAuth instance
     * @param {HttpClient} http - service for making HTTP requests
     * @param dataService
     * @param dialog
     * @param insightDataService
     * @param router
     * @param route
     */
    constructor(
        public authStateService: OktaAuthStateService,
        public injector: Injector,
        private http: HttpClient,
        private dataService: DataService,
        public dialog: MatDialog,
        private insightDataService: DataStateService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    /**
     *
     */
    ngOnInit(): void {
        if (
            localStorage.getItem('accessLevel') !== 'admin' &&
            localStorage.getItem('accessLevel') !== 'superAdmin'
        ) {
            this.router.navigate(['home']);
        }
        this.spinnerDisplay = true;
        this.getPrompts();
    }

    /**
     *
     */
    openAddEditPromptDialog() {
        const dialogRef = this.dialog.open(PromptaddeditDialogComponent, {
            width: '800px',
            enterAnimationDuration: 500,
            exitAnimationDuration: 500,
        });
        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.getPrompts();
                }
            },
        });
    }

    /**
     *
     * @param id
     * @param data
     * @param selectdTech
     * @param selectedPrompt
     */
    deleteApplication(data: any, selectdTech: number, selectedPrompt: any) {
        /* data.technologies = [
            {
                technology: selectdTech,
                prompts: [selectedPrompt],
            },
        ]; */
        const confirm = window.confirm('Are you sure you want to delete this application?');
        if (confirm) {
            data.technologies[selectdTech].prompts.splice(
                data.technologies[selectdTech].prompts.findIndex(
                    (promptData: any) => promptData.promptid === selectedPrompt.promptid
                ),
                1
            );
            this.dataService.updatePrompt(data.id, data).subscribe((res: any) => {
                console.log(res);
                this.getPrompts();
            });
        }
    }

    /**
     *
     * @param data
     * @param selectdTech
     * @param selectedPrompt
     */
    openEditForm(data: any, selectdTech: number, selectedPrompt: number) {
        data.selectdTech = selectdTech;
        data.selectedPrompt = selectedPrompt;
        const dialogRef = this.dialog.open(PromptaddeditDialogComponent, {
            width: '800px',
            enterAnimationDuration: 500,
            exitAnimationDuration: 500,
            data,
        });

        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.getPrompts();
                }
            },
        });
    }

    /**
     *
     */
    getPrompts() {
        this.spinnerDisplay = true;
        this.dataService.getPromptList().subscribe(
            (res) => {
                for (let i = 0; i < res.promptLibrarys.length; i++) {
                    let trim = true;
                    res.promptLibrarys[i].technologies?.forEach((promptTest: any) => {
                        if (promptTest.prompts.length > 0) {
                            trim = false;
                        }
                    });
                    if (trim) {
                        res.promptLibrarys.splice(i, 1);
                        i--;
                    }
                }
                this.dataSource = new MatTableDataSource(res.promptLibrarys);
                this.dataSource.sort = this.sort;
                // this.dataSource.paginator = this.paginator;
                this.spinnerDisplay = false;
            },
            (err: any) => {
                console.log(err);
                this.spinnerDisplay = false;
            }
        );
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
