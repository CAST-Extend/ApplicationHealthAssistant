/**
 * Interface for the PromptLibrary DTO that is returned for multiple API methods.
 * @see PromptLibraryBase PromptLibraryBase has details on additional properties of the PromptLibrary.
 */
import PromptLibraryBase from './PromptLibraryBase';

export default interface PromptLibrary extends PromptLibraryBase {
    /**
     * The ID for the PromptLibrary. This value will only be created by the server side
     * when a PromptLibrary is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
