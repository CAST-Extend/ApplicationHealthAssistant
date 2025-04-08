/**
 * Base interface that includes fields that are common to PullRequestLogBase related interfaces.
 * @see CreatePullRequestLogRequest
 * @see PullRequestLog
 * @see UpdatePullRequestLogRequest
 */
export default interface PullRequestLogBase {
    id?: string;

    applicationId: string;

    issueId: string;

    requestId: string;

    pr_details: any;

    username: string;

    createddate: string;
}
