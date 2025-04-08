/**
 * Interface for the response object that is returned in the body to a DELETE request to /pullRequestLogs.
 *
 * The operation returns the number of pullRequestLogs that were deleted.
 */
export default interface DeletePullRequestLogsResponse {
    /**
     * The number of pullRequestLogs that were deleted.
     */
    numPullRequestLogsDeleted?: number;
}
