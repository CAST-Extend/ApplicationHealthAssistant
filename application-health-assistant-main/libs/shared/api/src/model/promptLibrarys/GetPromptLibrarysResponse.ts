import PromptLibrary from './PromptLibrary';

/**
 * Interface for the response object that is returned in the body to a GET request to /PromptLibrary.
 */
export default interface GetPromptLibrarysResponse {
    /**
     * The returned list of user PromptLibrary
     */
    promptLibrarys?: Array<PromptLibrary>;
}
