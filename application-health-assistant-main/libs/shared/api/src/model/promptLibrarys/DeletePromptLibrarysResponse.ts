/**
 * Interface for the response object that is returned in the body to a DELETE request to /promptLibrarys.
 *
 * The operation returns the number of promptLibrarys that were deleted.
 */
export default interface DeletePromptLibrarysResponse {
    /**
     * The number of promptLibrarys that were deleted.
     */
    numPromptLibrarysDeleted?: number;
}
