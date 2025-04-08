/**
 * Interface for the PullRequestLog DTO that is returned for multiple API methods.
 * @see PullRequestLogBase PullRequestLogBase has details on additional properties of the PullRequestLog.
 */
import PullRequestLogBase from './PullRequestLogBase';

export default interface PullRequestLog extends PullRequestLogBase {
    /**
     * The ID for the PullRequestLog. This value will only be created by the server side
     * when a PullRequestLog is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
