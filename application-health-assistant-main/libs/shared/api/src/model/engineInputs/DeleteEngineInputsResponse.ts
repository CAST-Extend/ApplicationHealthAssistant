/**
 * Interface for the response object that is returned in the body to a DELETE request to /engineInputs.
 *
 * The operation returns the number of engineInputs that were deleted.
 */
export default interface DeleteEngineInputsResponse {
    /**
     * The number of engineInputs that were deleted.
     */
    numEngineInputsDeleted?: number;
}
