interface Prompt {
    promptid: string;

    prompt: string;
}

interface Technology {
    technology: string;

    prompts: Prompt[]; // Array of Prompt objects
}

/**
 * Base interface that includes fields that are common to PromptLibraryBase related interfaces.
 * @see CreatePromptLibraryRequest
 * @see PromptLibrary
 * @see UpdatePromptLibraryRequest
 */
export default interface PromptLibraryBase {
    applicationid: string | null; // Allow null if that's a possibility

    issueid: number;

    issuename: string;

    prompttype: string;

    technologies: Technology[]; // Array of Technology objects

    type: string;

    enabled: boolean;
}
