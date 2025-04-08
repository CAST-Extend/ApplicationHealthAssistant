export type EngineOutputsDocument = EngineOutput;

export class EngineOutput {
    id: string;

    requestid: string;

    issueid: string;

    applicationid: string;

    objects: [];

    contentinfo: [];

    status: string;

    createddate: string;
}
