/**
 * Interface for the EngineInput DTO that is returned for multiple API methods.
 * @see EngineInputBase EngineInputBase has details on additional properties of the EngineInput.
 */
import EngineInputBase from './EngineInputBase';

export default interface EngineInput extends EngineInputBase {
    /**
     * The ID for the EngineInput. This value will only be created by the server side
     * when a EngineInput is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
