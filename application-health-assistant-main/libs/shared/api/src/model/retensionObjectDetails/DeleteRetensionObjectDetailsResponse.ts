/**
 * Interface for the response object that is returned in the body to a DELETE request to /retensionObjectDetails.
 *
 * The operation returns the number of retensionObjectDetails that were deleted.
 */
export default interface DeleteRetensionObjectDetailsResponse {
    /**
     * The number of retensionObjectDetails that were deleted.
     */
    numRetensionObjectDetailsDeleted?: number;
}
