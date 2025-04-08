/**
 * Interface for the response object that is returned in the body to a DELETE request to /fileContents.
 *
 * The operation returns the number of fileContents that were deleted.
 */
export default interface DeleteFileContentsResponse {
    /**
     * The number of fileContents that were deleted.
     */
    numFileContentsDeleted?: number;
}
