/**
 * Base interface that includes fields that are common to FeedbackBase related interfaces.
 * @see CreateFeedbackRequest
 * @see Feedback
 * @see UpdateFeedbackRequest
 */
export default interface UsermBase {
    userName?: string;

    userType?: string;

    createdDate?: string;
}
