/**
 * Base interface that includes fields that are common to EngineOutputBase related interfaces.
 * @see CreateEngineOutputRequest
 * @see EngineOutput
 * @see UpdateEngineOutputRequest
 */
export default interface EngineOutputBase {
    requestid: string;

    issueid: string;

    applicationid: string;

    objects: [];

    contentinfo: [];

    status: string;

    createddate: string;
}
