/**
 * Interface for the RetensionObjectDetail DTO that is returned for multiple API methods.
 * @see RetensionObjectDetailBase RetensionObjectDetailBase has details on additional properties of the RetensionObjectDetail.
 */
import RetensionObjectDetailBase from './RetensionObjectDetailBase';

export default interface RetensionObjectDetail extends RetensionObjectDetailBase {
    /**
     * The ID for the RetensionObjectDetail. This value will only be created by the server side
     * when a RetensionObjectDetail is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
