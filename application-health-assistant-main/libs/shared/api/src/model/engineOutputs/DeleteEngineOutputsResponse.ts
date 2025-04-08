/**
 * Interface for the response object that is returned in the body to a DELETE request to /engineOutputs.
 *
 * The operation returns the number of engineOutputs that were deleted.
 */
export default interface DeleteEngineOutputsResponse {
    /**
     * The number of engineOutputs that were deleted.
     */
    numEngineOutputsDeleted?: number;
}
