/**
 * Interface for the request object that is passed as the body of a GET request to /EngineOutputs/filterEngineOutputs.
 *
 * The details in this object will be used to update an existing EngineOutput for the user.
 */
export default interface FilterEngineOutputRequest {
    keyValue: string;
}
