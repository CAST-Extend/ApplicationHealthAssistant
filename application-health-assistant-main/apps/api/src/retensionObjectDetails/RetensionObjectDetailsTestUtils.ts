import {
    RetensionObjectDetailBase,
    RetensionObjectDetail,
} from '@application-health-assistant/shared-api-model/model/retensionObjectDetails';

import mockRetensionObjectDetailsId from './mockRetensionObjectDetailsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class RetensionObjectDetailTestUtils {
    /**
     * Utility method for creating a RetensionObjectDetail for tests.
     * @param {number} identifier - An unique identifier to create a test RetensionObjectDetail.
     * @returns {RetensionObjectDetailBase} A RetensionObjectDetail with values that are base on the passed in identifier.
     */
    public static mockRetensionObjectDetailNoId(identifier: string): RetensionObjectDetailBase {
        const result = {} as RetensionObjectDetailBase;

        // result.SSP_AppName = `RetensionObjectDetail Application name ${identifier}`;
        // result.issuelist = `RetensionObjectDetail Issuelist ${identifier}`;
        result.applicationId = identifier;

        return result;
    }

    /**
     * Utility method for creating a RetensionObjectDetail for tests.
     * @param {number} identifier - An unique identifier to create a test RetensionObjectDetail.
     * @returns {RetensionObjectDetail} A RetensionObjectDetail with values that are base on the passed in identifier.
     */
    public static mockRetensionObjectDetailWithId(identifier: string): RetensionObjectDetail {
        const result = this.mockRetensionObjectDetailNoId(identifier) as RetensionObjectDetail;
        result.id = mockRetensionObjectDetailsId();
        return result;
    }
}
