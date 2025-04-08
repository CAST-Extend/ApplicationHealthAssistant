/**
 * Base interface that includes fields that are common to RetensionObjectDetailBase related interfaces.
 * @see CreateRetensionObjectDetailRequest
 * @see RetensionObjectDetail
 * @see UpdateRetensionObjectDetailRequest
 */
export default interface RetensionObjectDetailBase {
    issueId: string;

    applicationId: string;

    retensionObjectId: [];

    createddate: string;
}
