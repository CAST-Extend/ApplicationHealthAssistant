import IssueDetail from './IssueDetail';

/**
 * Interface for the response object that is returned in the body to a GET request to /IssueDetail.
 */
export default interface GetIssueDetailsResponse {
    /**
     * The returned list of user IssueDetail
     */
    issueDetails?: Array<IssueDetail>;
}
