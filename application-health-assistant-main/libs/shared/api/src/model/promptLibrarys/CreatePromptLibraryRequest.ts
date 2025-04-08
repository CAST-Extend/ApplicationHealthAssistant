/**
 * Interface for the request object that is passed as the body to a POST request to /PromptLibrarys.
 *
 * The details in this object will be used to create a new task for the user.
 */
import PromptLibraryBase from './PromptLibraryBase';

type PromptLibraryRequest = PromptLibraryBase;

export default PromptLibraryRequest;
