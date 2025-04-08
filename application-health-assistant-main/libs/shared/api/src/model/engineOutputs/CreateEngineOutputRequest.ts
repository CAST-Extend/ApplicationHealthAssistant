/**
 * Interface for the request object that is passed as the body to a POST request to /EngineOutputs.
 *
 * The details in this object will be used to create a new task for the user.
 */
import EngineOutputBase from './EngineOutputBase';

type EngineOutputRequest = EngineOutputBase;

export default EngineOutputRequest;
