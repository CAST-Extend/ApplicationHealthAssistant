/**
 * Interface for the IssueDetail DTO that is returned for multiple API methods.
 * @see IssueDetailBase IssueDetailBase has details on additional properties of the IssueDetail.
 */
import IssueDetailBase from './IssueDetailBase';

export default interface IssueDetail extends IssueDetailBase {
    /**
     * The ID for the IssueDetail. This value will only be created by the server side
     * when a IssueDetail is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
