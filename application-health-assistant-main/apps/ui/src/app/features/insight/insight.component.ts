/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines-per-function */
/* eslint-disable no-param-reassign */

import { getLocaleDateFormat } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import webComponentList from './web-components.json';
import environment from '../../../environments/environment';
import AlertDialogComponent from '../../shared/dialog/alert-dialog/alert-dialog.component';
import FeedbackDialogComponent from '../../shared/dialog/feedback-dialog/feedback-dialog.component';
import { ObjselectionDialogComponent } from '../../shared/dialog/objselection-dialog/objselection-dialog.component';
import PromptDialogComponent from '../../shared/dialog/prompt-dialog/prompt-dialog.component';
import { StatusdetailDialogComponent } from '../../shared/dialog/statusdetail-dialog/statusdetail-dialog.component';
import DataStateService from '../../shared/service/data-state.service';
import DataService from '../../shared/service/data.service';

@Component({
    selector: 'polaris-insight',
    templateUrl: './insight.component.html',
    styleUrls: ['./insight.component.scss'],
})
export default class InsightComponent implements OnInit {
    links = webComponentList;

    currentApp = localStorage.getItem('currentApp');

    activeissueidcolor: any;

    activeissueid: any;

    appData;

    apprequest: any;

    selectedObjList: any = [];

    spinnerDisplay = false;

    detailHeader = 'Green Impact';

    tableDataSource: any = [];

    envIssueStatusMapping: any = environment.issueStatusMapping;

    displayedColumns: string[] = ['issue', 'files', 'selectObj', 'status', 'fix', 'statusDetail'];

    objRetensionData: any = [];

    gitBaseUrl: string = environment.gitBaseUrl;

    /**
     *
     * @param insightDataService
     * @param router
     * @param dataService
     * @param dialog
     */
    constructor(
        private insightDataService: DataStateService,
        private router: Router,
        private dataService: DataService,
        public dialog: MatDialog
    ) {
        if (localStorage.getItem('appData')) {
            this.appData = JSON.parse(localStorage.getItem('appData') as string);
            this.tableDataSource = this.appData?.greenDetails;
        } else this.router.navigate(['']);
    }

    /**
     *
     */
    ngOnInit() {
        localStorage.removeItem('issueid');
        this.dataService.getRetensionObjAgainstApp(this.appData?.castAppName).subscribe(
            (responseObjData: any) => {
                this.tableDataSource.forEach((row: any) => {
                    const retensionData = responseObjData.retensionObjectDetails.find(
                        (retensionObj: any) => retensionObj.issueId === row.issueId
                    );

                    // apprequest = retensionData.issueid;

                    if (retensionData) {
                        row.objRetensionCount = retensionData.retensionObjectId?.length || 0;
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

    /**
     *
     * @param itemDetail
     */
    async fixIssues(itemDetail: any) {
        if (itemDetail.objSelectionStatus) {
            const dialogRef = this.dialog.open(PromptDialogComponent, {
                minWidth: '500px',
                enterAnimationDuration: '1000',
                exitAnimationDuration: '1000',
                data: itemDetail,
            });

            dialogRef.afterClosed().subscribe(async (result) => {
                if (result?.selected) {
                    const element = itemDetail;
                    element.status = 'In process';
                    this.spinnerDisplay = true;
                    element.promptid = result.promptid;
                    // Saving engine input
                    const objListForEngineIp: { objectid: any; filefullname: any; type: any }[] =
                        [];

                    itemDetail.objList.forEach((obj: any) => {
                        const objRow = {
                            objectid: obj.id,
                            filefullname: obj.fullName,
                            type: obj.type,
                        };
                        objListForEngineIp.push(objRow);
                    });
                    const objArray: number[] = [];
                    objListForEngineIp.forEach((obj: any) => {
                        objArray.push(obj.objectid);
                    });
                    this.objRetensionData = {
                        applicationId: this.appData.castAppName,
                        issueId: itemDetail.issueId,
                        retensionObjectId: objArray,
                    };

                    const engineInput = {
                        request: [
                            {
                                requestid: uuidv4(),
                                issueid: itemDetail.issueId,
                                applicationid: this.appData.castAppName,
                                tenantid: 'default',
                                repourl: this.appData.repoUrl,
                                status: 'Queued',
                                pullreqraised: false,
                                requestdetail: [
                                    {
                                        promptid: result.promptid,
                                        objectdetails: objListForEngineIp,
                                    },
                                ],
                            },
                        ],
                        createddate: new Date().toJSON('yyyy/MM/dd HH:mm'),
                    };
                    this.dataService.postEngineInput(engineInput).subscribe(
                        async (response: any) => {
                            element.engineIpId = response.createdEngineInputId;
                            // put inside AI engine call
                            itemDetail.objRetensionCount += itemDetail.objList.length;
                            itemDetail.objSelectionStatus = false;
                            itemDetail.objList = [];
                            // Call AHA AI engine to get pull req file change data
                            this.dataService
                                .callAiEngine(engineInput.request[0].requestid)
                                .subscribe(
                                    (aiEngineResponse: any) => {
                                        // After AI response update status
                                        // object retension logic
                                        this.dataService
                                            .postRetensionObjDetail(this.objRetensionData)
                                            .subscribe((postObjDetail: any) => {
                                                element.status = 'In process';
                                                this.spinnerDisplay = false;
                                                const status = {
                                                    success: true,
                                                    message:
                                                        'Request has been added to the processing queue, Please check the status under fix details & Create the pull request.',
                                                    error: '',
                                                };
                                                this.openDialog(status, '1000', '1000');
                                            });
                                    },
                                    (error: any) => {
                                        this.spinnerDisplay = false;
                                        const status = {
                                            success: false,
                                            message: 'AI engine API error, Please try again!',
                                            error,
                                        };
                                        this.openDialog(status, '1000', '1000');
                                    }
                                );
                        },
                        (error: any) => {
                            this.spinnerDisplay = false;
                            const status = {
                                success: false,
                                message: 'API error, Please try again!',
                                error,
                            };
                            this.openDialog(status, '1000', '1000');
                        }
                    );
                }
            });
        } else {
            const status = {
                success: false,
                message: 'Please select atleast 1 object to proceed !',
            };
            this.openDialog(status, '1000', '1000');
        }
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
        this.activeissueid = localStorage.getItem('issueid');
    }

    /**
     *
     */
    feedbackdialog() {
        this.dialog.open(FeedbackDialogComponent, {
            width: '600px',
        });
    }

    /**
     *
     */
    backButton() {
        this.router.navigate(['home', this.currentApp]);
    }

    /**
     *
     * @param selectdRow
     */
    openStatusDetailDialog(selectdRow: any) {
        const getReqDetails = {
            castAppDetail: this.appData,
            rowData: selectdRow,
        };
        const dialogRef = this.dialog.open(StatusdetailDialogComponent, {
            width: '1200px',
            data: getReqDetails,
            enterAnimationDuration: '1000',
            exitAnimationDuration: '1000',
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            // console.log(result);
        });
    }
}
