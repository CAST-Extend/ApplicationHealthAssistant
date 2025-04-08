/**
 * Make the model interfaces available from a single module.
 */
import CreateFileContentRequest from './fileContents/CreateFileContentRequest';
import DeleteFileContentsResponse from './fileContents/DeleteFileContentsResponse';
import FileContent from './fileContents/FileContent';
import FileContentBase from './fileContents/FileContentBase';
import GetFileContentsResponse from './fileContents/GetFileContentsResponse';
import UpdateFileContentRequest from './fileContents/UpdateFileContentRequest';

export {
    CreateFileContentRequest,
    DeleteFileContentsResponse,
    GetFileContentsResponse,
    FileContent,
    FileContentBase,
    UpdateFileContentRequest,
};
