import EngineOutput from './EngineOutput';

/**
 * Interface for the response object that is returned in the body to a GET request to /EngineOutput.
 */
export default interface GetEngineOutputsResponse {
    /**
     * The returned list of user EngineOutput
     */
    engineOutputs?: Array<EngineOutput>;
}
