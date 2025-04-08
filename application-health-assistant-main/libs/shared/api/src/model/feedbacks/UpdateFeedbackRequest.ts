/**
 * Interface for the request object that is passed as the body of a PUT request to /Feedbacks/{FeedbackId}.
 *
 * The details in this object will be used to update an existing Feedback for the user.
 */
import Feedback from './Feedback';

type UpdateFeedbackRequest = Feedback;

export default UpdateFeedbackRequest;
