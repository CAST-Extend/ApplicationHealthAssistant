/**
 * Interface for the ApplicationDtl DTO that is returned for multiple API methods.
 * @see ApplicationDtlBase ApplicationDtlBase has details on additional properties of the ApplicationDtl.
 */
import ApplicationDtlBase from './ApplicationDtlBase';

export default interface ApplicationDtl extends ApplicationDtlBase {
    /**
     * The ID for the ApplicationDtl. This value will only be created by the server side
     * when a ApplicationDtl is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
