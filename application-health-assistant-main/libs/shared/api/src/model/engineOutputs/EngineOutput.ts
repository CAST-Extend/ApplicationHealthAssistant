/**
 * Interface for the EngineOutput DTO that is returned for multiple API methods.
 * @see EngineOutputBase EngineOutputBase has details on additional properties of the EngineOutput.
 */
import EngineOutputBase from './EngineOutputBase';

export default interface EngineOutput extends EngineOutputBase {
    /**
     * The ID for the EngineOutput. This value will only be created by the server side
     * when a EngineOutput is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
