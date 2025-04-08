/**
 * Interface for the request object that is passed as the body to a POST request to /PullRequestLogs.
 *
 * The details in this object will be used to create a new task for the user.
 */
import PullRequestLogBase from './PullRequestLogBase';

type PullRequestLogRequest = PullRequestLogBase;

export default PullRequestLogRequest;
