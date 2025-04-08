/**
 * Make the model interfaces available from a single module.
 */
import ApplicationDtl from './applicationDtls/ApplicationDtl';
import ApplicationDtlBase from './applicationDtls/ApplicationDtlBase';
import CreateApplicationDtlRequest from './applicationDtls/CreateApplicationDtlRequest';
import DeleteApplicationDtlsResponse from './applicationDtls/DeleteApplicationDtlsResponse';
import GetApplicationDtlsResponse from './applicationDtls/GetApplicationDtlsResponse';
import UpdateApplicationDtlRequest from './applicationDtls/UpdateApplicationDtlRequest';

export {
    CreateApplicationDtlRequest,
    DeleteApplicationDtlsResponse,
    GetApplicationDtlsResponse,
    ApplicationDtl,
    ApplicationDtlBase,
    UpdateApplicationDtlRequest,
};
