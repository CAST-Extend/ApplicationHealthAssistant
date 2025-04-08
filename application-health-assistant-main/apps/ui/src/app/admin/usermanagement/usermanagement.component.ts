import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OktaAuthStateService } from '@okta/okta-angular';

import AlertDialogComponent from '../../shared/dialog/alert-dialog/alert-dialog.component';
import BasicActionDialogComponent from '../../shared/dialog/basicaction-dialog/basicaction-dialog.component';
import usermanagementaddeditDialogComponent from '../../shared/dialog/usermanagementaddedit-dialog/usermanagementaddedit-dialog.component';
import DataStateService from '../../shared/service/data-state.service';
import DataService from '../../shared/service/data.service';

@Component({
    selector: 'polaris-prompt',
    templateUrl: './usermanagement.component.html',
    styleUrls: ['./usermanagement.component.scss'],
})
export default class UsermanagementComponent implements OnInit {
    spinnerDisplay = false;

    displayedColumns: string[] = ['userName', 'userType', 'action'];

    currentUser: any;

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
        if (localStorage.getItem('accessLevel') !== 'superAdmin') {
            this.router.navigate(['home']);
        }
        this.spinnerDisplay = true;
        this.currentUser = localStorage.getItem('currentUser');
        this.getUsers();
    }

    /**
     *
     */
    openAddEditUserDialog() {
        const data = this.dataSource.filteredData;
        const dialogRef = this.dialog.open(usermanagementaddeditDialogComponent, {
            data,
        });
        /* const dialogRef = this.dialog.open(usermanagementaddeditDialogComponent, {
            width: '800px',
            enterAnimationDuration: 500,
            exitAnimationDuration: 500,
        }); */
        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.getUsers();
                }
            },
        });
    }

    /**
     *
     * @param id
     * @param userName
     */
    deleteUser(id: any, userName: string) {
        const dialogRef = this.dialog.open(BasicActionDialogComponent, {
            width: '400px',
            data: {
                message: `Are you sure you want to delete user '${userName}' ?`,
                content: { data: id, action: this.dataService.deleteUser(id) },
            },
        });

        dialogRef.afterClosed().subscribe(
            (result: any) => {
                console.log('Dialog closed!', result);

                if (result && result === 'close_on_success') {
                    this.getUsers();
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
        const dialogRef = this.dialog.open(usermanagementaddeditDialogComponent, {
            width: '800px',
            enterAnimationDuration: 500,
            exitAnimationDuration: 500,
            data,
        });

        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.getUsers();
                }
            },
        });
    }

    /**
     *
     */
    getUsers() {
        this.spinnerDisplay = true;

        this.dataService.getUser().subscribe(
            (res) => {
                this.dataSource = new MatTableDataSource(res.Userms);
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
