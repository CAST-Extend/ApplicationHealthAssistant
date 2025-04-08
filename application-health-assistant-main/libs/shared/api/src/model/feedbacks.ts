/**
 * Make the model interfaces available from a single module.
 */
import CreateFeedbackRequest from './feedbacks/CreateFeedbackRequest';
import DeleteFeedbacksResponse from './feedbacks/DeleteFeedbacksResponse';
import Feedback from './feedbacks/Feedback';
import FeedbackBase from './feedbacks/FeedbackBase';
import GetFeedbacksResponse from './feedbacks/GetFeedbacksResponse';
import UpdateFeedbackRequest from './feedbacks/UpdateFeedbackRequest';

export {
    CreateFeedbackRequest,
    DeleteFeedbacksResponse,
    GetFeedbacksResponse,
    Feedback,
    FeedbackBase,
    UpdateFeedbackRequest,
};
