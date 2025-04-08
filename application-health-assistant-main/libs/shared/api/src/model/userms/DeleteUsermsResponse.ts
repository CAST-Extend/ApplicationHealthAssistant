/**
 * Interface for the response object that is returned in the body to a DELETE request to /feedbacks.
 *
 * The operation returns the number of feedbacks that were deleted.
 */
export default interface DeleteUsermsResponse {
    /**
     * The number of feedbacks that were deleted.
     */
    numUsermsDeleted?: number;
}
