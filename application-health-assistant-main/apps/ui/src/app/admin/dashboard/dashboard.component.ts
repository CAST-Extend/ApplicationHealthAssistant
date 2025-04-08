/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OktaAuthStateService } from '@okta/okta-angular';

import AlertDialogComponent from '../../shared/dialog/alert-dialog/alert-dialog.component';
import AppaddeditDialogComponent from '../../shared/dialog/appaddedit-dialog/appaddedit-dialog.component';
import BasicActionDialogComponent from '../../shared/dialog/basicaction-dialog/basicaction-dialog.component';
import DataStateService from '../../shared/service/data-state.service';
import DataService from '../../shared/service/data.service';

@Component({
    selector: 'polaris-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export default class DashboardComponent implements OnInit {
    spinnerDisplay = false;

    displayedColumns: string[] = ['SSP_AppName', 'CastKey', 'ProductCode', 'action'];

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
        this.getProjects();
    }

    /**
     *
     */
    openAddEditAppDialog() {
        const data = this.dataSource.filteredData;
        const dialogRef = this.dialog.open(AppaddeditDialogComponent, {
            data,
        });
        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.getProjects();
                }
            },
        });
    }

    /**
     *
     * @param id
     * @param appName
     */
    deleteApplication(id: any, appName: string) {
        const dialogRef = this.dialog.open(BasicActionDialogComponent, {
            width: '400px',
            data: {
                message: `Are you sure you want to delete CAST App '${appName}' ?`,
                content: { data: id, action: this.dataService.deleteProject(id) },
            },
        });

        dialogRef.afterClosed().subscribe(
            (result: any) => {
                console.log('Dialog closed!', result);

                if (result && result === 'close_on_success') {
                    this.ngOnInit();
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    /**
     *
     * @param data
     */
    openEditForm(data: any) {
        const dialogRef = this.dialog.open(AppaddeditDialogComponent, {
            data,
			
        });

        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.getProjects();
                }
            },
        });
    }

    /**
     *
     */
    getProjects() {
        this.spinnerDisplay = true;
        this.dataService.getProjectList().subscribe(
            (res) => {
                this.dataSource = new MatTableDataSource(res.applicationDtls);
                this.dataSource.sort = this.sort;
                // this.dataSource.paginator = this.paginator;
                this.spinnerDisplay = false;
            },
            (err: any) => {
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
