/**
 * Interface for the request object that is passed as the body of a PUT request to /issueDetails/{issueDetailId}.
 *
 * The details in this object will be used to update an existing issueDetail for the user.
 */
import IssueDetail from './IssueDetail';

type UpdateIssueDetailRequest = IssueDetail;

export default UpdateIssueDetailRequest;
