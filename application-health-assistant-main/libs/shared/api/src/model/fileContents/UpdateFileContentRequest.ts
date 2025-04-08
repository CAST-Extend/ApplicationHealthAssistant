/**
 * Interface for the request object that is passed as the body of a PUT request to /FileContents/{FileContentId}.
 *
 * The details in this object will be used to update an existing FileContent for the user.
 */
import FileContent from './FileContent';

type UpdateFileContentRequest = FileContent;

export default UpdateFileContentRequest;
