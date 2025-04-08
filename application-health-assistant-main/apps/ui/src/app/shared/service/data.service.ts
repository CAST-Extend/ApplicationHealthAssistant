import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Octokit } from '@octokit/rest';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import environment from '../../../environments/environment';
import { from, of } from 'rxjs';
import { tap } from 'rxjs/operators';

// 1. First create an interface for your app data model (recommended)
export interface Application {
  id: string;
  name: string;
  // other properties...
}

@Injectable({
    providedIn: 'root',
})
export default class DataService {
    /**
     *
     * @param http
     */
    private apiBaseUrl: string;

    // private apiBaseUrl: string;

    private username$ = new BehaviorSubject('');

    getUsername = this.username$.asObservable();

    private pythonApiBaseUrl: string;

    private castApiUrl: string;

    private getCastIssue: string;

    private apiToPostEngineIpUrl: string;

    private apiToGetPromptList: string;

    private apiToUserData: string;

    private apiToProcessPrompt: string;

    private apiToGetReqStatus: string;

    private apiToCallAiEngine: string;

    private apiToCallPythonAiEngine: string;

    private apiToGetRetensionObj: string;

    private apiToGetRetensionObjForApp: string;

    private apiToPostRetensionObj: string;

    private apiToFilterEngineOutput: string;

    private apitoPostpullRequsetData: string;

    private apitoFeedbackData: string;

    private apiToGetUserAccess: string;

    private apitofetchcastdtls: string;

    private apicastimagapplication: string;
	
	private imagingAPIBaseURL: string;

    /**
     *
     * @param http
     */
    constructor(private http: HttpClient) {
        this.apiBaseUrl = environment.apiBaseUrl;
        this.pythonApiBaseUrl = environment.pythonApiBaseUrl;
        this.castApiUrl = environment.apiToGetAllCastAppUrl;
        this.getCastIssue = environment.apiToGetAppVul;
        this.apiToPostEngineIpUrl = environment.apiToPostEngineIpUrl;
        this.apiToGetPromptList = environment.apiToGetPromptList;
        this.apiToProcessPrompt = environment.apiToProcessPrompt;
        this.apiToUserData = environment.apiToUserData;
        this.apiToGetReqStatus = environment.apiToGetReqStatus;
        this.apiToCallAiEngine = environment.apiToCallAiEngine;
        this.apiToCallPythonAiEngine = environment.apiToCallPythonAiEngine;
        this.apiToGetRetensionObj = environment.apiToGetRetensionObj;
        this.apiToGetRetensionObjForApp = environment.apiToGetRetensionObjForApp;
        this.apiToPostRetensionObj = environment.apiToPostRetensionObj;

        this.apiToFilterEngineOutput = environment.apiToFilterEngineOutput;
        this.apitoPostpullRequsetData = environment.apitoPostpullRequsetData;
        this.apitoFeedbackData = environment.apitoFeedbackData;
        this.apiToGetUserAccess = environment.apiToGetUserAccess;
        this.apitofetchcastdtls = environment.apitofetchcastdtls;
        this.apicastimagapplication = environment.apicastimagapplication;
		this.imagingAPIBaseURL = environment.imagingAPIBaseURL;
    }

    /**
     *
     */
    getProjectList(): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}${this.castApiUrl}`);
    }

    /**
     *
     * @param subject
     * @param message
     */
    sendEmail(subject: string, message: string): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}email`, { subject, message });
    }

    /**
     *
     */
    getAllowedProject(): Observable<any> {
    const octokit = new Octokit({ auth: localStorage.getItem('access_token') });
    const projectList = this.getProjectList();

    console.log("Fetching projectList...");
    projectList.subscribe({
        next: (data) => console.log("✅ Project List Data:", data),
        error: (err) => console.error("❌ Error in projectList:", err)
    });

    const userAccessList = from(octokit.repos.listForAuthenticatedUser({ per_page: 1000 }));

    console.log("Fetching userAccessList...");
    userAccessList.subscribe({
        next: (data) => console.log("✅ User Access Data:", data),
        error: (err) => console.error("❌ Error in userAccessList:", err)
    });

    return forkJoin([projectList, userAccessList]).pipe(
        tap(data => console.log("✅ Final forkJoin Data:", data)),
        catchError(error => {
            console.error("❌ Error in forkJoin:", error);
            return of([]); // Ensure forkJoin does not fail silently
        })
    );
}


    /**
     *
     */
    getPromptList(): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}${this.apiToGetPromptList}`);
    }

    /**
     *
     */
    async fetchUsername(): Promise<void> {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken !== 'undefined' && accessToken !== '') {
                const octokit = new Octokit({ auth: accessToken });
                const response = await octokit.rest.users.getAuthenticated();
                const username = response.data.login.split('_')[0];
                localStorage.setItem('currentUser', response.data.login);
                this.username$.next(username);
            } else {
                this.username$.next('');
            }
        } catch (error) {
            // console.error('Error fetching user information:', error);
            this.username$.next('');
        }
    }

    /**
     *
     * @param id
     * @param data
     */
    deletePrompt(id: any, data: any): Observable<any> {
        return this.http.delete(`${this.apiBaseUrl}${this.apiToProcessPrompt}/${id}`, data);
    }

    /**
     *
     * @param promptData
     */
    addPromptToList(promptData: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apiToProcessPrompt}`, promptData);
    }

    /**
     *
     * @param id
     * @param data
     */
    updatePrompt(id: any, data: any): Observable<any> {
        return this.http.put(`${this.apiBaseUrl}${this.apiToProcessPrompt}/${id}`, data);
    }

    /**
     *
     */
    getMasterIssueList(): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}issueDetails`);
    }

    /**
     *
     * @param appName
     */
    getIssueList(appName: string): Observable<any> {
		console.log("In getIssueList");
		console.log("URL", `${this.apiBaseUrl}${this.castApiUrl}/getCastInfo?name=${appName}`);
        //return this.http.get(`${this.apiBaseUrl}${this.castApiUrl}/getCastInfo?name=${appName}`);
        // Direct API call
        return this.http.get(`${this.getCastIssue}${appName}/insights/green-detection-patterns`);
    }

    /**
     *
     * @param objData
     */
    getObjectAgainstIssue(objData: any): Observable<any> {
       /* return this.http.get(
            `${this.apiBaseUrl}${this.castApiUrl}/getCastInfoForObject?name=${objData?.castAppName}&issueId=${objData.rowData?.issueId}`
        );*/
        // Direct API call
        return this.http.get(
            `${this.getCastIssue}${objData?.castAppName}/insights/green-detection-patterns/${objData.rowData?.issueId}/findings?limit=500`
        );
    }

    /**
     *
     * @param filePath
     * @param requestid
     */
    getFileContentFromReqId(requestid: string): Observable<any> {
        return this.http.get(`${environment.apiToGetFileContent}/${requestid}`);
    }

    /**
     *
     * @param issueId
     */
    getPromptAgainstIssue(issueId: any): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}${this.apiToGetPromptList}/${issueId}`);
    }

    /**
     *
     * @param objData
     * @param engineIp
     */
    postEngineInput(engineIp: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apiToPostEngineIpUrl}`, engineIp);
    }

    /**
     *
     * @param queryParam
     */
    /* getEngineOutputIssueStatus(queryParam: any): Observable<any> {
        return this.http.get(
            `${this.apiBaseUrl}${this.apiToGetIssueStatus}/${queryParam.rowData?.issueId}/${queryParam.castAppDetail?.castAppName}`
        );
    } */

    /**
     *
     * @param queryParam
     */
    getEngineInputRequestStatus(queryParam: any): Observable<any> {
        return this.http.get(
            `${this.apiBaseUrl}${this.apiToGetReqStatus}/${queryParam.rowData?.issueId}/${queryParam.castAppDetail?.castAppName}`
        );
    }

    /**
     *
     * @param issueId
     * @param engIpReqId
     */
    callAiEngine(engIpReqId: any): Observable<any> {
        // wrapper call
        // return this.http.get(`${this.apiBaseUrl}${this.castApiUrl}/callAiEngine?id=${engIpReqId}`);
        return this.http.get(
            `${this.pythonApiBaseUrl}${this.apiToCallPythonAiEngine}/${engIpReqId}`
        );
    }

    /**
     *
     * @param queryParam
     */
    getRetensionObjDetail(queryParam: any): Observable<any> {
        return this.http.get(
            `${this.apiBaseUrl}${this.apiToGetRetensionObj}/${queryParam.rowData.issueId}/${queryParam.castAppName}`
        );
    }

    /**
     *
     * @param castAppName
     */
    getRetensionObjAgainstApp(castAppName: any): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}${this.apiToGetRetensionObjForApp}/${castAppName}`);
    }

    /**
     *
     * @param objData
     * @param engineIp
     */
    postRetensionObjDetail(objData: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apiToPostRetensionObj}`, objData);
    }

    /**
     *
     * @param key
     * @param reqId
     */
    getObjectStatusAgainstReqid(key: string, reqId: any): Observable<any> {
        return this.http.get(
            `${this.apiBaseUrl}${this.apiToFilterEngineOutput}?key=${key}&value=${reqId}`
        );
    }

    /**
     *
     * @param data
     */
    addproject(data: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.castApiUrl}`, data);
    }
	
	

    /**
     *
     * @param id
     * @param data
     */
    updateProject(id: any, data: any): Observable<any> {
        return this.http.put(`${this.apiBaseUrl}${this.castApiUrl}/${id}`, data);
    }

    /**
     *
     * @param id
     */
    deleteProject(id: any): Observable<any> {
        return this.http.delete(`${this.apiBaseUrl}${this.castApiUrl}/${id}`);
    }

    /**
     *
     * @param data
     */
    updateInputFlag(data: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apiToPostEngineIpUrl}/updateFlag`, data);
    }

    /**
     * @param objData
     * @param engineIp
     */
    postpullRequestlog(objData: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apitoPostpullRequsetData}`, objData);
    }

    /**
     * Feedback api
     * @param objData
     * @param engineIp
     */
    postfeedbackdata(objData: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apitoFeedbackData}`, objData);
    }

    /**
     *
     * @param userName
     */
    getUserAccessDetail(userName: string): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}${this.apiToGetUserAccess}/${userName}`);
    }

    /**
     *
     *@param CAST_AppName
     * @param ProductCode
     */
    async getbranchnameandlastscan(
        ProductCode: string,
        CAST_AppName: string
    ): Promise<Observable<any>> {
        //const urirepdata = await fetch(`${this.apitofetchcastdtls}${ProductCode}`);
        //const urldata: any = await urirepdata.json();
        //const newdata: ApiResponse[] = urldata;
        //const newdataArray = Object.entries(newdata);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //const multiProjectsEntry = newdataArray.find(([key, value]) => key === 'MultiProjects');
        //const multiProjectsValue = multiProjectsEntry ? multiProjectsEntry[1] : null; // Get the value or null if not found

        // Take the first array from the "MultiProjects" key
        /*const firstMultiProject =
            Array.isArray(multiProjectsValue) && multiProjectsValue.length > 0
                ? multiProjectsValue[0]
                : null; */
        // Fetch the branch name from the first MultiProject
        //const branchName = firstMultiProject ? firstMultiProject.BranchName : null; // Adjust this based on the structure of the firstMultiProject

        const apicastimagResponse = await fetch(`${this.imagingAPIBaseURL}rest/tenants/default/applications`);
		console.log("Application Data",apicastimagResponse);
        const apicastimagData = await apicastimagResponse.json(); // Convert response to JSON

        // Find a particular entry based on the name
        const foundEntry = apicastimagData.find(
            (entry: { name: string }) => entry.name === CAST_AppName
        );
        const appdetails = {
            //branch: branchName,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            //lastscan: Object.entries(newdata).find(([key, value]) => key === 'LastScanDate')?.[1],
            castimagelastdate: foundEntry.delivery.dateTime,
        };
        return Object(appdetails);
    }

    /**
     *
     * @param value
     * @param input
     */
    // eslint-disable-next-line class-methods-use-this
    convertToDateTime(input: string): string | null {
        // Check if the input matches the expected format
        const regex = /^v(\d{6})\.(\d{6})$/;
        const match = input.match(regex);

        if (match) {
            const datePart = match[1]; // '241218'
            const timePart = match[2]; // '040920'

            // Extract year, month, day from datePart
            const year = parseInt(datePart.substring(0, 2), 10) + 2000; // Assuming 21st century
            const month = parseInt(datePart.substring(2, 4), 10) - 1; // Months are 0-indexed
            const day = parseInt(datePart.substring(4, 6), 10);

            // Extract hour, minute, second from timePart
            const hour = parseInt(timePart.substring(0, 2), 10);
            const minute = parseInt(timePart.substring(2, 4), 10);
            const second = parseInt(timePart.substring(4, 6), 10);

            // Create a new Date object
            const date = new Date(year, month, day, hour, minute, second);

            // Format the date into the desired format
            const options: Intl.DateTimeFormatOptions = {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
            };

            // Get the formatted date string
            const formattedDate = date.toLocaleString('en-US', options);

            // Remove the comma from the formatted string
            return formattedDate.replace(',', '');
        }

        return null; // Return null if the format is incorrect
    }

    /**
     *
     * @param appShortkey
     */
    getAppDataFromSsp(appShortkey: string): Observable<any> {
        return this.http.get(`${this.apitofetchcastdtls}${appShortkey}`);
    }

    /**
     *
     * @param appShortkey
     */
    getCastImgData(): Observable<any> {
        return this.http.get(`${this.apicastimagapplication}`);
    }

    /**
     *
     * @param appShortkey
     */
    addAppDetails(appShortkey: string): Observable<any> {
        const sspData = this.getAppDataFromSsp(appShortkey);
        const castImgData = this.getCastImgData();
        console.log(`sspData${sspData}`);
        console.log(`CAST Imaging Data${castImgData}`);
        return forkJoin([sspData, castImgData]);
    }
	
	

		// 2. Improved method with proper typing and error handling
  getAvailableApps(): Observable<Application[]> {
	//return this.http.get(`${this.imagingAPIBaseURL}/rest/tenants/default/applications`);
    return this.http.get<Application[]>(`${this.imagingAPIBaseURL}rest/tenants/default/applications`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        // You can transform the error here if needed
        throw new Error('Failed to fetch applications. Please try again later.');
      })
    );
  }

    /**
     *
     *
     */
    getUser(): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}${this.apiToUserData}`);
    }

    /**
     *
     * @param data
     */
    addUser(data: any): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}${this.apiToUserData}`, data);
    }

    /**
     *
     * @param id
     * @param data
     */
    updateUser(id: any, data: any): Observable<any> {
        return this.http.put(`${this.apiBaseUrl}${this.apiToUserData}/${id}`, data);
    }

    /**
     *
     * @param id
     */
    deleteUser(id: any): Observable<any> {
        return this.http.delete(`${this.apiBaseUrl}${this.apiToUserData}/${id}`);
    }
}

interface ApiResponse {
    // Define the structure of the expected response
    AppDetailId: number;
    ApplicationName: string;
    BUName: string;
    CASTApplicationID: number;
    CASTDomainID: number;
    CASTKey: string;
    CreatedBy: string;
    CreatedOn: Date;
    Mode: string;
    // LastScanDate: string;
    MultiProjects: [];
    ProductCode: string;
    RequestedBy: string;
    ScheduledScan: string;
    ServiceID: number;
    SourceControlId: number;
    SourceControlURL: string;
    Status: string;
    TechnicalContactEmail: string;
    UpdatedBy: string;
    UpdatedOn: Date;
    // Add other fields as necessary
}
