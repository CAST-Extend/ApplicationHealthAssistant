import Userm from './Userm';

/**
 * Interface for the response object that is returned in the body to a GET request to /Feedback.
 */
export default interface GetUsermsResponse {
    /**
     * The returned list of user Feedback
     */
    Userms?: Array<Userm>;
}
