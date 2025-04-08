import {
    ApplicationDtlBase,
    ApplicationDtl,
} from '@application-health-assistant/shared-api-model/model/applicationDtls';

import mockApplicationDtlsId from './mockApplicationDtlsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class ApplicationDtlTestUtils {
    /**
     * Utility method for creating a ApplicationDtl for tests.
     * @param {number} identifier - An unique identifier to create a test ApplicationDtl.
     * @returns {ApplicationDtlBase} A ApplicationDtl with values that are base on the passed in identifier.
     */
    public static mockApplicationDtlNoId(identifier: number): ApplicationDtlBase {
        const result = {} as ApplicationDtlBase;

        result.SSP_AppName = `ApplicationDtl Application name ${identifier}`;
        // result.issuelist = `ApplicationDtl Issuelist ${identifier}`;
        result.SSP_AppID = identifier;

        return result;
    }

    /**
     * Utility method for creating a ApplicationDtl for tests.
     * @param {number} identifier - An unique identifier to create a test ApplicationDtl.
     * @returns {ApplicationDtl} A ApplicationDtl with values that are base on the passed in identifier.
     */
    public static mockApplicationDtlWithId(identifier: number): ApplicationDtl {
        const result = this.mockApplicationDtlNoId(identifier) as ApplicationDtl;
        result.id = mockApplicationDtlsId();
        return result;
    }
}
