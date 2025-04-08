/**
 * Interface for the request object that is passed as the body of a PUT request to /PromptLibrarys/{PromptLibraryId}.
 *
 * The details in this object will be used to update an existing PromptLibrary for the user.
 */
import PromptLibrary from './PromptLibrary';

type UpdatePromptLibraryRequest = PromptLibrary;

export default UpdatePromptLibraryRequest;
