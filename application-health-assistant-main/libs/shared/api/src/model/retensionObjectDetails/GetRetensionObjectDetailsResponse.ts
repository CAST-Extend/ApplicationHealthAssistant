import RetensionObjectDetail from './RetensionObjectDetail';

/**
 * Interface for the response object that is returned in the body to a GET request to /RetensionObjectDetail.
 */
export default interface GetRetensionObjectDetailsResponse {
    /**
     * The returned list of user RetensionObjectDetail
     */
    retensionObjectDetails?: Array<RetensionObjectDetail>;
}
