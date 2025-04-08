/* eslint-disable no-template-curly-in-string */
// Vault stores the Okta config object as a string so we need to explicitly construct the object and Boolean values
const oktaConfig = JSON.parse('${{ UI_OKTA_CONFIG_ANGULAR }}');
const production = JSON.parse('${{ UI_PRODUCTION }}');
const baseUrl = new URL(oktaConfig.redirectUri);

baseUrl.hostname = window.location.hostname;
oktaConfig.redirectUri = baseUrl.href;
oktaConfig.postLogoutUri = `https://${window.location.hostname}`;
const environment = {
    gitToken: '${{UI_GIT_TOKEN}}',
    gitBaseUrl: 'https://github.com/mmctech/',
    UI_GitHubClientId: '${{UI_GitHubClientId}}',
    UI_GitHubRedirectUri: '${{UI_GitHubRedirectUri}}',
    apiToGetAppVul: '${{UI_CAST_URL}}',
    appVersion: '${{UI_APP_VERSION}}',
    production,
    apiBaseUrl: '${{UI_API_BASE_URL}}',
    pythonApiBaseUrl: '/api-python/v1/',
    oktaConfig,
    tenant: 'default',
    apiToGetAllCastAppUrl: 'applicationDtls',
    apiToPostEngineIpUrl: 'engineInputs',
    apiToGetPromptList: 'promptLibrarys',
    apiToProcessPrompt: 'promptLibrarys/customPrompt',
    apiToGetReqStatus: 'engineInputs/getinputdatausingissueidwithapplicationid',
    apiToGetFileContent: '${{UI_API_BASE_URL}}fileContents',
    apiToCallAiEngine: 'callAiEngine',
    apiToCallPythonAiEngine: 'ProcessRequest',
    apiToGetRetensionObj: 'retensionObjectDetails/getoutputdatausingissueidwithapplicationid',
    apiToGetRetensionObjForApp: 'retensionObjectDetails/getoutputdatausingapplicationid',
    apiToPostRetensionObj: 'retensionObjectDetails',
    apiToFilterEngineOutput: 'engineOutputs/filterEngineOutputs',
    apitoPostpullRequsetData: 'pullRequestLogs',
    apitoFeedbackData: 'feedbacks',
    // apitofetchcastdtls: 'https://api-ssp.mmc.com/api/CASTJob/getCastJobByID?productCode=',
    apitofetchcastdtls: 'https://api-ssp.mmc.com/api/CASTJob/getCASTJobByAppShortKey?appShortKey=',
    apicastimagapplication: 'https://castimaging.mmc.com/rest/tenants/default/applications',
	UI_GitHubClientId: 'Iv23liJwqsKdox0Dehtf',
	UI_GitHubClientSecret: 'b88905f756c6e89bfa602cb88d48544401a80463',
    apiToGetUserAccess: 'userms/getUser',
    apiToUserData: 'userms',
    issueStatusMapping: {
        0: 'Open',
        1: 'In process',
        2: 'Completed',
        3: 'partial success',
        4: 'Pull Req Raised',
    },
};

export default environment;
