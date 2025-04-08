/**
 * Interface for the request object that is passed as the body to a POST request to /issueDetails.
 *
 * The details in this object will be used to create a new task for the user.
 */
import IssueDetailBase from './IssueDetailBase';

type IssueDetailRequest = IssueDetailBase;

export default IssueDetailRequest;
