/**
 * Base interface that includes fields that are common to ApplicationDtlBase related interfaces.
 * @see CreateApplicationDtlRequest
 * @see ApplicationDtl
 * @see UpdateApplicationDtlRequest
 */
export default interface ApplicationDtlBase {
    /**
     * SSP_AppName of the application
     */
    SSP_AppName?: string;

    /**
     * Cast name of the application
     */

    CAST_AppName?: string;

    /**
     * SSP_AppID of application
     */
    SSP_AppID?: number;

    /**
     * CastKey of application
     */
    CastKey?: string;

    /**
     * branchName of application
     */
    branchName?: string;

    /**
     * ProductCode of application
     */
    ProductCode?: string;

    /**
     * Repository of application
     */
    Repository?: string;

    /**
     * Last Scan date when ever it is requested
     */
    lastScanDate?: Date;
}
