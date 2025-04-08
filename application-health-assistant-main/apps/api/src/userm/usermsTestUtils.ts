import { UsermBase, Userm } from '@application-health-assistant/shared-api-model/model/userms';

import mockUsermsId from './mockUsermsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class FeedbackTestUtils {
    /**
     * Utility method for creating a Feedback for tests.
     * @param {number} identifier - An unique identifier to create a test Feedback.
     * @returns {UsermBase} A Feedback with values that are base on the passed in identifier.
     */
    public static mockUsermNoId(identifier: string): UsermBase {
        const result = {} as UsermBase;

        // result.SSP_AppName = `Feedback Application name ${identifier}`;
        // result.issuelist = `Feedback Issuelist ${identifier}`;
        result.feedback_description = identifier;

        return result;
    }

    /**
     * Utility method for creating a Feedback for tests.
     * @param {number} identifier - An unique identifier to create a test Feedback.
     * @returns {Userm} A Feedback with values that are base on the passed in identifier.
     */
    public static mockFeedbackWithId(identifier: string): Userm {
        const result = this.mockUsermNoId(identifier) as Userm;
        result.id = mockUsermsId();
        return result;
    }
}
