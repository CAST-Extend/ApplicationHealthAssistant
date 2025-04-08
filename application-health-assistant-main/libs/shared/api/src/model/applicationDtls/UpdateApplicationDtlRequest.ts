/**
 * Interface for the request object that is passed as the body of a PUT request to /ApplicationDtls/{ApplicationDtlId}.
 *
 * The details in this object will be used to update an existing ApplicationDtl for the user.
 */
import ApplicationDtl from './ApplicationDtl';

type UpdateApplicationDtlRequest = ApplicationDtl;

export default UpdateApplicationDtlRequest;
