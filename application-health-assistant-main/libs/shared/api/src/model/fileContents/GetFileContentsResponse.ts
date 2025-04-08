import FileContent from './FileContent';

/**
 * Interface for the response object that is returned in the body to a GET request to /FileContent.
 */
export default interface GetFileContentsResponse {
    /**
     * The returned list of user FileContent
     */
    fileContents?: Array<FileContent>;
}
