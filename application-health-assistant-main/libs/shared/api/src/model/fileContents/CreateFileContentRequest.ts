/**
 * Interface for the request object that is passed as the body to a POST request to /FileContents.
 *
 * The details in this object will be used to create a new task for the user.
 */
import FileContentBase from './FileContentBase';

type FileContentRequest = FileContentBase;

export default FileContentRequest;
