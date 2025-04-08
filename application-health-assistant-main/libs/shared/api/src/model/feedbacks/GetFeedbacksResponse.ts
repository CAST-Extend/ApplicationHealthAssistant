import Feedback from './Feedback';

/**
 * Interface for the response object that is returned in the body to a GET request to /Feedback.
 */
export default interface GetFeedbacksResponse {
    /**
     * The returned list of user Feedback
     */
    feedbacks?: Array<Feedback>;
}
