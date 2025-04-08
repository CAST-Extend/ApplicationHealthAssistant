/**
 * Interface for the request object that is passed as the body of a PUT request to /PullRequestLogs/{PullRequestLogId}.
 *
 * The details in this object will be used to update an existing PullRequestLog for the user.
 */
import PullRequestLog from './PullRequestLog';

type UpdatePullRequestLogRequest = PullRequestLog;

export default UpdatePullRequestLogRequest;
