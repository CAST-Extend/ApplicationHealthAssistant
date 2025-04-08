export type PromptLibrarysDocument = PromptLibrary;

interface Prompt {
    promptid: string;
    prompt: string;
}

interface Technology {
    technology: string;
    prompts: Prompt[]; // Array of Prompt objects
}

export class PromptLibrary {
    id: string;

    applicationid: string | null; // Allow null if that's a possibility

    issueid: number;

    issuename: string;

    prompttype: string;

    technologies: Technology[]; // Array of Technology objects

    type: string;

    enabled: boolean;
}
