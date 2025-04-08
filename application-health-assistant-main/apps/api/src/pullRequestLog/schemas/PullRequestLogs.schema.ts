export type PullRequestLogsDocument = PullRequestLog;

export class PullRequestLog {
    id: string;

    applicationId: string;

    issueId: string;

    requestId: string;

    pr_details: any;

    username: string;

    createddate: string;
}
