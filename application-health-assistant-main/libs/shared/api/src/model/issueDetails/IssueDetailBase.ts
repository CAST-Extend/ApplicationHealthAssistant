/**
 * Base interface that includes fields that are common to IssueDetailBase related interfaces.
 * @see CreateIssueDetailRequest
 * @see IssueDetail
 * @see UpdateIssueDetailRequest
 */
export default interface IssueDetailBase {
    /**
     * Id of the application
     */
    issueId?: string;

    issueTitle?: string;

    issueType?: string;

    createdDate?: string;
}
