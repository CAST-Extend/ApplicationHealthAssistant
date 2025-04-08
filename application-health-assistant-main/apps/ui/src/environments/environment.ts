// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// TODO: Uncomment and fix import when run as part of the tests.

// import packageInfo  from '../../../../package.json';
// The client ID value is not sensitive. No values in the environment.ts files can be sensitive as these files are loaded into a user's web browser.
// This client ID value only gets used for local development (unlike environment.prod.ts which is used in the dev/prod-preview/prod envs).
// The values in environment.prod.ts get replaced with values from Vault by the Entrypoint script. We can't use the Entrypoint script locally because it needs to connect to Vault using Kubernetes auth (which we can't do locally).
// If we want this find/replace on the environment.ts, we'll need a different mechanism.
// Ultimately this only removes the value from the repo, anyone that goes to the deployed Blueprint site will be able to look at the source code and get this value.
const environment = {
    appVersion: '0.0.1',
    production: false,
    apiBaseUrl: 'http://localhost:8080/api/v1/',

    // apiBaseUrl: 'http://localhost:8080/api/v1/',
    gitToken: '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',
    // http://127.0.0.1:8081
    pythonApiBaseUrl:
        'http://127.0.0.1:9081/api-python/v1/',
    tenant: 'default',
    // https://usdf11v1252.mrshmc.com
    apiToGetAppVul: 'http://localhost:5000/rest/tenants/default/applications/',
	imagingAPIBaseURL: 'http://localhost:5000/',
    apiToGetAllCastAppUrl: 'applicationDtls',
    apiToPostEngineIpUrl: 'engineInputs',
    apiToGetPromptList: 'promptLibrarys',
    apiToProcessPrompt: 'promptLibrarys/customPrompt',
    apiToGetReqStatus: 'engineInputs/getinputdatausingissueidwithapplicationid',
    // apitofetchcastdtls: 'https://api-ssp.mmc.com/api/CASTJob/getCastJobByID?productCode=',
    apitofetchcastdtls: 'https://api-ssp.mmc.com/api/CASTJob/getCASTJobByAppShortKey?appShortKey=',
    apicastimagapplication: 'http://localhost:5000/rest/tenants/default/applications/',

    apiToGetFileContent:
        'http://localhost:8080/api/v1/fileContents',
    apiToCallAiEngine: 'callAiEngine',
    apiToCallPythonAiEngine: 'ProcessRequest',
    apiToGetRetensionObj: 'retensionObjectDetails/getoutputdatausingissueidwithapplicationid',
    apiToGetRetensionObjForApp: 'retensionObjectDetails/getoutputdatausingapplicationid',
    apiToPostRetensionObj: 'retensionObjectDetails',
    apiToFilterEngineOutput: 'engineOutputs/filterEngineOutputs',
    apitoPostpullRequsetData: 'pullRequestLogs',
    apitoFeedbackData: 'feedbacks',
    apiToGetUserAccess: 'userms/getUser',
    apiToUserData: 'userms',
    githubToken: '',
    gitBaseUrl: 'https://github.com/BhanuPrakash2203/',
    UI_GitHubClientId: 'Iv23liJwqsKdox0Dehtf',
	UI_GitHubClientSecret: 'b88905f756c6e89bfa602cb88d48544401a80463',
    UI_GitHubRedirectUri: 'http://localhost:4200/auth/callback',
    // Required values for configuring the Okta SDK (https://github.com/okta/okta-auth-js#configuration-options)
    oktaConfig: {
        clientId: '6b544676-1695-425b-9417-863cd4f0b088-b95952c6-7710-4fc0-ae3b-8b0690dea7cf',
        issuer: 'https://mmc-dallas-int-non-prod-ingress.mgti.mmc.com/authentication/v1',
        redirectUri: 'http://localhost:4200/login/callback',
        scopes: [],
        pkce: true,
        postLogoutUri: 'http://localhost:4200',
    },
    oktaSignInConfig: {
        baseUrl: 'https://mmc-dallas-int-non-prod-ingress.mgti.mmc.com',
        clientId: '6b544676-1695-425b-9417-863cd4f0b088-b95952c6-7710-4fc0-ae3b-8b0690dea7cf',
        redirectUri: 'http://localhost:4200/login/callback',
    },
    issueStatusMapping: {
        0: 'Open',
        1: 'In process',
        2: 'Completed',
        3: 'partial success',
        4: 'Pull Req Raised',
    },
};

export default environment;
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
