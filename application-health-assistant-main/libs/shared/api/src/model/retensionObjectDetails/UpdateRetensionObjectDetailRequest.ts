/**
 * Interface for the request object that is passed as the body of a PUT request to /RetensionObjectDetails/{RetensionObjectDetailId}.
 *
 * The details in this object will be used to update an existing RetensionObjectDetail for the user.
 */
import RetensionObjectDetail from './RetensionObjectDetail';

type UpdateRetensionObjectDetailRequest = RetensionObjectDetail;

export default UpdateRetensionObjectDetailRequest;
