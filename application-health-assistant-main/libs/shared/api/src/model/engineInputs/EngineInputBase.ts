/**
 * Base interface that includes fields that are common to EngineInputBase related interfaces.
 * @see CreateEngineInputRequest
 * @see EngineInput
 * @see UpdateEngineInputRequest
 */
export default interface EngineInputBase {
    request: any;
    requestid?: any;
    flag?: any;
    pullReqraisedFlag?: any;
    Createddate: Date;
}
