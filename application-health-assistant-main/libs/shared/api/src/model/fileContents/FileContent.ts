/**
 * Interface for the FileContent DTO that is returned for multiple API methods.
 * @see FileContentBase FileContentBase has details on additional properties of the FileContent.
 */
import FileContentBase from './FileContentBase';

export default interface FileContent extends FileContentBase {
    /**
     * The ID for the FileContent. This value will only be created by the server side
     * when a FileContent is created.
     *
     * It should be a 24 character hex string, which will be populated with a
     * stringified MongoDB ObjectID.
     */
    id?: string;
}
