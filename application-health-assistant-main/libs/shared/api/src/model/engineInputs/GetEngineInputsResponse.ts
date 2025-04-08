import EngineInput from './EngineInput';

/**
 * Interface for the response object that is returned in the body to a GET request to /EngineInput.
 */
export default interface GetEngineInputsResponse {
    /**
     * The returned list of user EngineInput
     */
    engineInputs?: Array<EngineInput>;
}
