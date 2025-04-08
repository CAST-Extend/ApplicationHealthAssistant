/**
 * Base interface that includes fields that are common to FileContentBase related interfaces.
 * @see CreateFileContentRequest
 * @see FileContent
 * @see UpdateFileContentRequest
 */
export default interface FileContentBase {
    updatedcontentinfo: [];

    requestid: string;

    createddate: Date;
}
