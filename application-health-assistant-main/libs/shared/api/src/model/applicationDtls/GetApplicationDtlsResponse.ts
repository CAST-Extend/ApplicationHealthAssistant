import ApplicationDtl from './ApplicationDtl';

/**
 * Interface for the response object that is returned in the body to a GET request to /ApplicationDtl.
 */
export default interface GetApplicationDtlsResponse {
    /**
     * The returned list of user ApplicationDtl
     */
    applicationDtls?: Array<ApplicationDtl>;
}
