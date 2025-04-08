/**
 * Interface for the request object that is passed as the body to a POST request to /Feedbacks.
 *
 * The details in this object will be used to create a new task for the user.
 */
import FeedbackBase from './FeedbackBase';

type FeedbackRequest = FeedbackBase;

export default FeedbackRequest;
