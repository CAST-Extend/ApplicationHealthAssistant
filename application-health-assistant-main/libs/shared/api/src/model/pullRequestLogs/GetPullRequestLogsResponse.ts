import PullRequestLog from './PullRequestLog';

/**
 * Interface for the response object that is returned in the body to a GET request to /PullRequestLog.
 */
export default interface GetPullRequestLogsResponse {
    /**
     * The returned list of user PullRequestLog
     */
    pullRequestLogs?: Array<PullRequestLog>;
}
