/**
 * Constants related to SIEM logging to ensure consistency in the values used across the codebase.
 */

export enum IdentityProvider {
    OKTA = 'Okta',
}

export enum AuthenticationChannel {
    SSO = 'SSO',
    OAUTH = 'OAUTH',
}

export enum ApplicationComponent {
    OKTA_GUARD = 'OktaGuard',
    TASKS_SERVICE = 'TasksService',
    ISSUEDETAILS_SERVICE = 'IssueDetailsService',
    APPLICATIONDTLS_SERVICE = 'ApplicationDtlsService',
    ENGINEINPUTS_SERVICE = 'EngineInputsService',
    USERM_SERVICE = 'UsermService',
    ENGINEOUTPUTS_SERVICE = 'RetensionObjectDetailsService',
    RETENSIONOBJECTDETAILS_SERVICE = 'EngineOutputsService',
    PROMPTLIBRARYS_SERVICE = 'PromptLibrarysService',
    FILECONTENTS_SERVICE = 'FileContentsService',
    PULLREQUESTLOGS_SERVICE = 'PullRequestLogsService',
    FEEDBACKS_SERVICE = 'FeedbacksService',
}
