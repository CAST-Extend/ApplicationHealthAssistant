/**
 * Interface for the request object that is passed as the body of a PUT request to /EngineInputs/{EngineInputId}.
 *
 * The details in this object will be used to update an existing EngineInput for the user.
 */
import EngineInput from './EngineInput';

type UpdateEngineInputRequest = EngineInput;

export default UpdateEngineInputRequest;
