/* eslint-disable max-lines-per-function */

import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { OktaAuthStateService, OKTA_CONFIG } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firstValueFrom, interval, map, Subscription } from 'rxjs';

import environment from '../../../environments/environment';
import AlertDialogComponent from '../../shared/dialog/alert-dialog/alert-dialog.component';
import { ObjselectionDialogComponent } from '../../shared/dialog/objselection-dialog/objselection-dialog.component';
import DataStateService from '../../shared/service/data-state.service';
import DataService from '../../shared/service/data.service';

@Component({
    selector: 'polaris-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export default class HomeComponent implements OnInit {
    currentYear = new Date().getFullYear();

    oktaAuth: OktaAuth;

    spinnerDisplay = false;

    showDetail = false;

    appdetails: any;

    showGreenPatternsBox = false;

    detailHeader = '';

    displayedColumns: string[] = [
        'issue',
        'files',
        'selectObj',
        'status',
        'statusDetail',
        'fix',
        'raise',
    ];

    fixArray: any = [];

    tableDataSource: any = [];

    projectList$: any = [];

    selectedObjList: any = [];

    data: any;

    selected: any | undefined;

    selectAppObjectFromList: any;

    appData: any;

    countryCtrl = new FormControl('');

    engineOutputAPISubscription$!: Subscription;

    envIssueStatusMapping: any = environment.issueStatusMapping;

    currentApp!: any;

    currentAppDetails: any;

    objRetensionData: any = [];

    gitBaseUrl: string = environment.gitBaseUrl;

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
    ) {
        // the OktaAuth instance is not directly available through the constructor dependency injection. Use the injector instead
        this.oktaAuth = injector.get(OKTA_CONFIG).oktaAuth;
    }

    /**
     *
     */
    ngOnInit(): void {
        localStorage.removeItem('issueid');
        this.dataService.fetchUsername();
        this.checkRoute();
        this.getProjects();
    }

    /**
     *
     */
    getProjects() {
    this.spinnerDisplay = true;
    this.dataService.getAllowedProject().subscribe(
        (response: any) => {
            console.log("Received Response in getProjects:", response);

                const allAppList = response[0].applicationDtls;
                const userAppList = response[1].data;


            console.log("📌 All Applications List:", allAppList);
            console.log("📌 User Access List:", userAppList);

            const filteredArray = allAppList.filter((item: any) =>
                userAppList.map((x: any) => x.name).includes(item.Repository)
            );

            this.projectList$ = allAppList.filter((x: any) => x.AhaOnboard === 'true');

            console.log("🚀 Filtered Project List:", this.projectList$);

            this.spinnerDisplay = false;
			
			console.log("🔍 Current App:", this.currentApp);
            if (this.currentApp) {
                this.currentAppDetails = this.projectList$.find(
                    (item: any) => item.ProductCode === this.currentApp
                );
                console.log("🔍 Current App Details:", this.currentAppDetails);

                this.selected = this.currentAppDetails?.ProductCode;
                this.onChangeMtd(this.currentAppDetails);
            }
        },
        (error) => {
            console.error("❌ Error in getProjects:", error);
        }
    );
}


    /**
     *
     * @param event
     */
    onChangeMtd(event: any) {
        localStorage.removeItem('issueid');
        this.selected = event?.ProductCode;
        this.appData = {};
        if (event?.ProductCode) {
            this.spinnerDisplay = true;
			console.log("In onChangeMtd");
            this.dataService.getIssueList(event?.CAST_AppName).subscribe(
                (response: any) => {
                    this.processResponseData(event, response);
					console.log("In DataService", response);
                    this.showGreenPatternsBox = true;
                },
                (error: any) => {
                    this.spinnerDisplay = false;
                    const status = {
                        success: false,
                        message: 'API error, Please try again!!!',
                        error,
                    };
					console.log("In DataService");
                    this.openDialog(status, '1000', '1000');
                    this.showGreenPatternsBox = false;
                    // console.error('Error fetching data:', error);
                }
            );
        }
    }

    /**
     *
     * @param event
     * @param response
     */
    async processResponseData(event: any, response: any) {
        const cloudReadyDetail: {
            technology: any;
            issue: any;
            issueId: any;
            obj: number;
            objRetensionCount: number;
            status: number;
            objSelectionStatus: boolean;
            pullReqStatus: boolean;
        }[] = [];
        const greenDetail: {
            technology: any;
            issue: any;
            issueId: any;
            obj: number;
            objRetensionCount: number;
            status: number;
            objSelectionStatus: boolean;
            pullReqStatus: boolean;
        }[] = [];
        Array.from(response).forEach((greenPatten: any) => {
            const rowDetail = {
                technology: '',
                issue: greenPatten.name,
                issueId: greenPatten.id,
                obj: greenPatten.nbObjects,
                objRetensionCount: 0,
                objSelectionStatus: false,
                status: this.envIssueStatusMapping[0],
                pullReqStatus: false,
            };
            greenDetail.push(rowDetail);
        });
        this.appdetails = await this.dataService.getbranchnameandlastscan(
            event.ProductCode,
            event.CAST_AppName
        );
        const lastIndex = event.Repository.lastIndexOf('/');
        this.appData = {
            name: event.SSP_AppName,
            castAppName: event.CAST_AppName,
            repoUrl: event.Repository,
            repoName: event.Repository.substr(lastIndex + 1),
           // branch: this.appdetails.branch || 'master',
		   branch: event.branchName,
            productCode: event.ProductCode,
            // sspAppId: event.SSP_AppID,
            cloudReadyCount: cloudReadyDetail.length,
            cloudReadyDetails: cloudReadyDetail,
            greenDetailCount: greenDetail.length,
            greenDetails: greenDetail,
        };
        this.spinnerDisplay = false;
        this.insightDataService.setInsightData(this.appData);
        if (this.selected) localStorage.setItem('currentApp', this.appData.productCode);
        if (this.appData) localStorage.setItem('appData', JSON.stringify(this.appData));
    }

    /**
     *
     */
    cloudBlocker() {
        this.showDetail = true;
        this.detailHeader = 'Cloud Blockers Issues';
        this.tableDataSource = this.appData?.cloudReadyDetails;
    }

    /**
     *
     */
    greenImpact() {
        this.showDetail = true;
        this.detailHeader = 'Green Impact';
        this.tableDataSource = this.appData?.greenDetails;
        this.router.navigate(['insight']);
    }

    /**
     *
     */
    backButton() {
        this.showDetail = false;
    }

    /**
     *
     * @param issueId
     * @param selectdRow
     */
    openObjectSelectionDialog(selectdRow: any) {
        const getObjDetails = {
            castAppName: this.appData?.castAppName,
            rowData: selectdRow,
        };
        const dialogRef = this.dialog.open(ObjselectionDialogComponent, {
            width: '1200px',
            data: getObjDetails,
            enterAnimationDuration: '1000',
            exitAnimationDuration: '1000',
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            this.selectedObjList.find((element: any) => element.issueId === result.rowData.issueId);
        });
    }

    /* @param status
     * @param enterAnimationDuration
     * @param exitAnimationDuration
     */
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

    /**
     *
     */
    checkRoute() {
        this.route.params.subscribe((params) => {
            console.log("Route params:", params);
            if (params['currentApp']) {
                this.currentApp = params['currentApp'];
                console.log("Set currentApp from route:", this.currentApp);
                // Now that we have currentApp, load projects
                //this.getProjects();
            } else {
                // No app in route, just load projects normally
				console.log("🔍 Inside Current App Details:", this.currentApp);
                this.getProjects();
            }
        });
    }
}
