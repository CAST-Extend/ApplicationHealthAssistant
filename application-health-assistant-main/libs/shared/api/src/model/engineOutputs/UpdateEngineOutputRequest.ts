/**
 * Interface for the request object that is passed as the body of a PUT request to /EngineOutputs/{EngineOutputId}.
 *
 * The details in this object will be used to update an existing EngineOutput for the user.
 */
import EngineOutput from './EngineOutput';

type UpdateEngineOutputRequest = EngineOutput;

export default UpdateEngineOutputRequest;
