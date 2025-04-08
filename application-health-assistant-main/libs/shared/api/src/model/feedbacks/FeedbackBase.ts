/**
 * Base interface that includes fields that are common to FeedbackBase related interfaces.
 * @see CreateFeedbackRequest
 * @see Feedback
 * @see UpdateFeedbackRequest
 */
export default interface FeedbackBase {
    Customer_rating: number;

    feedback_description: string;

    username: string;

    createddate: string;
}
