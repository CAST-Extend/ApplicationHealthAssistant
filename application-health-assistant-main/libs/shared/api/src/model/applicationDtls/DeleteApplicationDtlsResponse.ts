/**
 * Interface for the response object that is returned in the body to a DELETE request to /applicationDtls.
 *
 * The operation returns the number of applicationDtls that were deleted.
 */
export default interface DeleteApplicationDtlsResponse {
    /**
     * The number of applicationDtls that were deleted.
     */
    numApplicationDtlsDeleted?: number;
}
