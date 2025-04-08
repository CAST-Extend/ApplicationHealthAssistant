/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/order */
/* eslint-disable max-lines-per-function */
/* eslint-disable no-param-reassign */
/* eslint max-lines: ["error", {"max": 400, "skipComments": true}] */
import { Buffer } from 'buffer';

import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Octokit } from '@octokit/rest';

// import { firstValueFrom, interval, map, Subscription } from 'rxjs';

// import { firstValueFrom, interval, map, Subscription } from 'rxjs';

import { interval } from 'rxjs';

// import environment from '../../../../environments/environment';
import DataService from '../../service/data.service';
import AlertDialogComponent from '../alert-dialog/alert-dialog.component';
import ObjectstatusdetailDialogComponent from '../objectstatusdetail-dialog/objectstatusdetail-dialog.component';
// import PromptDialogComponent from '../prompt-dialog/prompt-dialog.component';

@Component({
    selector: 'polaris-statusdetail-dialog',
    templateUrl: './statusdetail-dialog.component.html',
    styleUrl: './statusdetail-dialog.component.scss',
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { displayDefaultIndicatorType: false },
        },
    ],
})
export class StatusdetailDialogComponent implements OnInit {
    spinnerDisplay = false;

    pullReqInPro = false;

    reqStatList: any;

    objReqCount = 0;

    subscription: any;

    gitToken: string | null = localStorage.getItem('access_token');

    retryReqData: any = {};

    /**
     *
     * @param dialogRef
     * @param data
     * @param getObjDetails
     * @param dialog
     * @param dataService
     */
    constructor(
        public dialogRef: MatDialogRef<StatusdetailDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public getObjDetails: any,
        public dialog: MatDialog,
        private dataService: DataService
    ) {
        dialogRef.disableClose = true;
        this.bindData();
    }

    /**
     *
     */
    ngOnInit() {
        this.subscription = interval(10000).subscribe(() => {
            this.bindData();
        });
    }

    /**
     *
     */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    /**
     *
     */
    bindData() {
        this.spinnerDisplay = true;
        this.dataService.getEngineInputRequestStatus(this.getObjDetails).subscribe(
            (response: any) => {
                this.reqStatList = response.engineInputs;
                this.spinnerDisplay = false;
            },
            (error: any) => {
                this.spinnerDisplay = false;
            }
        );
    }

    /**
     *
     * @param reqDetail
     */
    retryPythonAiReq(reqDetail: any) {
        this.pullReqInPro = true;
        this.dataService.callAiEngine(reqDetail.request[0]?.requestid).subscribe(
            (aiEngineResponse: any) => {
                reqDetail.request[0].status = 'Queued';
                const flagData = {
                    requestid: reqDetail.request[0]?.requestid,
                    flag: 'status',
                };
                this.dataService.updateInputFlag(flagData).subscribe(
                    (flagUpdate: any) => {
                        this.pullReqInPro = false;
                        const status = {
                            success: true,
                            message:
                                'Request has been added to the processing queue again, Please check the status after some time & Create the pull request.',
                            error: '',
                        };
                        this.openDialog(status, '1000', '1000');
                    },
                    (error: any) => {
                        this.pullReqInPro = false;
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
                this.pullReqInPro = false;
                const status = {
                    success: false,
                    message: 'AI engine API error, Please try again!',
                    error,
                };
                this.openDialog(status, '1000', '1000');
            }
        );
    }

    /**
     *
     * @param obj
     * @param objData
     */
    openObjDetail(objData: any) {
        this.dialog.open(ObjectstatusdetailDialogComponent, {
            width: '800px',
            enterAnimationDuration: 500,
            exitAnimationDuration: 500,
            data: { objData, status: false },
        });
    }

    /**
     *
     * @param reqDetail
     * @param reqDtl
     */
    openReqDetailStatus(reqDtl: any) {
        // call api to get api status
        this.spinnerDisplay = true;
        const filterKey = 'requestid';
        this.dataService.getObjectStatusAgainstReqid(filterKey, reqDtl.requestid).subscribe(
            (response: any) => {
                this.spinnerDisplay = false;
                this.dialog.open(ObjectstatusdetailDialogComponent, {
                    width: '800px',
                    enterAnimationDuration: 500,
                    exitAnimationDuration: 500,
                    data: { objData: response.objects, status: true },
                });
            },
            (error: any) => {
                this.spinnerDisplay = false;
            }
        );
    }

    /**
     *
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /**
     *
     * @param itemDetail
     */
    async createPullReq(itemDetail: any) {
        localStorage.removeItem('issueid');
        if (!this.pullReqInPro) {
            this.pullReqInPro = true;
            itemDetail.request[0].issueName = this.getObjDetails.rowData.issue;
            const gitData = {
                repoName: this.getObjDetails.castAppDetail?.repoName,
                repoUrl: this.getObjDetails.castAppDetail?.repoUrl,
                branch: this.getObjDetails.castAppDetail?.branch,
            };
            // write code to get file content
            this.dataService.getFileContentFromReqId(itemDetail.request[0].requestid).subscribe(
                async (response: any) => {
                    this.pullReqInPro = true;
                    const filePath: any[] = [];
                    const fileContent: any[] = [];
                    response.fileContents[0].updatedcontentinfo.forEach((fileDetails: any) => {
                        filePath.push(fileDetails.filepath);
                        fileContent.push(fileDetails.updatedfilecontent);
                    });
                    let token: string;
                    if (this.gitToken === null || this.gitToken === '') {
                        // eslint-disable-next-line @typescript-eslint/no-throw-literal
                        throw 'Couldnt resolve git token';
                    } else {
                        token = this.gitToken;
                    }

                    const pullStatus = await getAndUpdateRepo(
                        token,
                        gitData,
                        itemDetail,
                        filePath,
                        fileContent
                    );
                    this.pullReqInPro = true;
                    if (pullStatus.success) {
                        itemDetail.request[0].pullreqraised = true;
                        // itemDetail.status = 'In process';
                        // API call to update pull req status
                        const flagData = {
                            requestid: itemDetail.request[0]?.requestid,
                            pullReqraisedFlag: true,
                            flag: 'pullreqraised',
                        };
                        this.dataService.updateInputFlag(flagData).subscribe(
                            (aiEngineResponse: any) => {
                                // API call to add log entry
                                const pullReqLog = {
                                    applicationId: itemDetail.request[0]?.applicationid,
                                    requestId: itemDetail.request[0]?.requestid,
                                    issueId: itemDetail.request[0]?.issueid,
                                    pr_details: {
                                        prname: `Fixed by AHA for Request id: ${itemDetail.request[0]?.requestid} & Issue id : ${itemDetail.request[0]?.requestid.issueid}`,
                                        repo: this.getObjDetails.castAppDetail?.repoName,
                                    },
                                    username: localStorage.getItem('currentUser') || '',
                                    createddate: new Date().toJSON('yyyy/MM/dd HH:mm'),
                                };
                                this.dataService.postpullRequestlog(pullReqLog).subscribe(
                                    (logRes: any) => {
                                        this.pullReqInPro = false;
                                        this.openDialog(pullStatus, '1000', '1000');
                                        this.bindData();
                                    },
                                    (error: any) => {
                                        this.pullReqInPro = false;
                                        const status = {
                                            success: false,
                                            message: 'Failed to log pull request information.',
                                            error,
                                        };
                                        this.openDialog(status, '1000', '1000');
                                    }
                                );
                            },
                            (error: any) => {
                                this.pullReqInPro = false;
                                const status = {
                                    success: false,
                                    message: 'Pull req status update operation failed.',
                                    error,
                                };
                                this.openDialog(status, '1000', '1000');
                            }
                        );
                    } else {
                        // itemDetail.status = 'Open';
                        this.pullReqInPro = false;
                        this.openDialog(pullStatus, '1000', '1000');
                    }
                },
                (error: any) => {
                    this.pullReqInPro = false;
                }
            );
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
    }
}

/**
 *
 * @param owner
 * @param repo
 * @param branchName
 * @param newBranchName
 * @param filePathArray
 * @param fileContent
 * @param commitMessage
 * @param pullRequestTitle
 * @param pullRequestBody
 * @param token
 */
async function updateAndCreatePullRequest(
    owner: string,
    repo: string,
    branchName: string,
    newBranchName: string,
    filePathArray: any,
    fileContent: string,
    commitMessage: string,
    pullRequestTitle: string,
    pullRequestBody: string,
    token: string
) {
    try {
        const octokit = new Octokit({ auth: token });
		 if (!branchName) {
        const repoInfo = await octokit.repos.get({ owner, repo });
        branchName = repoInfo.data.default_branch; // Usually "main"
    }
        let latestCommitSha;
        try {
            const branchResponse = await octokit.repos.getBranch({
                owner,
                repo,
                branch: branchName,
            });
			console.log("Fetching branch:", { owner, repo, branch: branchName });
			console.log("Full Response:", JSON.stringify(branchResponse, null, 2));
			console.log("Branch Data:", JSON.stringify(branchResponse.data, null, 2));
            latestCommitSha = branchResponse.data.commit.sha;
			console.log("Branch Response - After Commit", branchResponse);
        } catch (error: any) {
			console.error("Detailed Error:", error);
            return {
                success: false,
                message: 'Failed to fetch application branch from github.',
                error: '',
            };
        }
        let newBranchResponse: any;
        let isExist: boolean;
        try {
            const newBranchResponse = await octokit.repos.getBranch({
                owner,
                repo,
                branch: newBranchName,
            });
            isExist = true;
        } catch (error: any) {
            isExist = false;
        }
        if (!isExist) {
            try {
                await octokit.git.createRef({
                    owner,
                    repo,
                    ref: `refs/heads/${newBranchName}`,
                    sha: latestCommitSha,
                });
            } catch (error: any) {
                return {
                    success: false,
                    message: 'Failed to create new branch.',
                    error: '',
                };
            }
        }
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < filePathArray.length; index++) {
            let fileSha: string | undefined;
            try {
                // eslint-disable-next-line no-await-in-loop
                const { data } = await octokit.repos.getContent({
                    owner,
                    repo,

                    path: (filePathArray[index] = filePathArray[index].replace(/([^/]*\/){1}/, '')),
                    ref: branchName,
                });
                if (Array.isArray(data)) {
                    return {
                        success: false,
                        message: 'The specified file path is incorrect.',
                        error: '',
                    };
                    // eslint-disable-next-line no-else-return
                } else {
                    fileSha = data.sha;
                }
            } catch (error: any) {
                return {
                    success: false,
                    message: 'Failed to get file data.',
                    error: '',
                };
            }

            if (fileContent[index] === null || fileContent[index] === '') {
                return {
                    success: false,
                    message: 'No content generated by AI',
                    error: '',
                };
            }
            try {
                // eslint-disable-next-line no-await-in-loop
                await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: filePathArray[index],
                    message: commitMessage,
                    content: Buffer.from(fileContent[index]).toString('base64'),
                    branch: newBranchName,
                    sha: fileSha,
                });
            } catch (error: any) {
                return {
                    success: false,
                    message: 'Failed to update the file content.',
                    error: '',
                };
            }
        }
        try {
            await octokit.pulls.create({
                owner,
                repo,
                title: pullRequestTitle,
                body: pullRequestBody,
                head: newBranchName,
                base: branchName,
            });
        } catch (error: any) {
            return {
                success: false,
                message: 'Failed to create pull request.',
                error: '',
            };
        }
        return { success: true, message: 'Pull request created successfully!', error: '' };
    } catch (error: any) {
        return {
            success: false,
            message: 'Operation failed, Error occurred while raising pull request,',
            error: error.message || error,
        };
    }
}

// To be moved in node/nest service file

/**
 *
 * @param token
 * @param repoDetails
 * @param reqDetails
 * @param filepath
 * @param filecontent
 */
async function getAndUpdateRepo(
    token: string,
    repoDetails: any,
    reqDetails: any,
    filepath: any,
    filecontent: any
) {
    try {
        const octokit = new Octokit({ auth: token });
        // const response = await octokit.repos.listForAuthenticatedUser();
        const username = localStorage.getItem('currentUser') || '';
        const repo = JSON.parse(localStorage.getItem('appData') as string);
        const repoNameReq = repo.repoName;
        const userAccess = await octokit.request(
            'GET /repos/{owner}/{repo}/collaborators/{username}/permission',
            {
                owner: 'BhanuPrakash2203',
                repo: repoNameReq,
                username,
            }
        );
        // const repoCon = response.data.find((repo: any) => repo.name === repoDetails.repoName);
        if (
            userAccess.data.permission === 'write' ||
            userAccess.data.permission === 'admin' ||
            userAccess.data.permission === 'maintain'
        ) {
            const owner = 'BhanuPrakash2203';
            const repoName = repoNameReq;
            const branchName = repoDetails.branch;
            const filePath = filepath;
            const fileContent = filecontent;
            const commitMessage = 'Pull request for Green Impact vulnerability';
            const pullRequestTitle = `Fixed by AHA for Request id: ${reqDetails.request[0].requestid} & Issue id : ${reqDetails.request[0].issueid}`;
            const pullRequestBody = `Fixed for CAST issue: ${reqDetails.request[0].issueName}`;
            const newBranchName = `${reqDetails.request[0].issueid}-${reqDetails.request[0].requestid}`;
            const result = await updateAndCreatePullRequest(
                owner,
                repoName,
                branchName,
                newBranchName,
                filePath,
                fileContent,
                commitMessage,
                pullRequestTitle,
                pullRequestBody,
                token
            );
            return result;
        }

        const status = {
            success: false,
            message:
                "You don't have appropriate access to this repository. To raise a pull request, User must have write/admin/maintain access level on the repository!",
            error: '',
        };
        return status;
    } catch (error: any) {
        const status = {
            success: false,
            message: 'Issue in fetching access details, Please try again.',
            error: '',
        };
        return status;
    }
}

export interface ObjectElement {
    id: string;
    fullName: string;
    type: string;
    mangling: string;
}
