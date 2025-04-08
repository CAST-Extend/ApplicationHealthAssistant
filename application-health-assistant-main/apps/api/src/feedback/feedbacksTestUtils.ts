import {
    FeedbackBase,
    Feedback,
} from '@application-health-assistant/shared-api-model/model/feedbacks';

import mockFeedbacksId from './mockFeedbacksId';

/**
 * Testing utils for the local Jest tests.
 */
export default class FeedbackTestUtils {
    /**
     * Utility method for creating a Feedback for tests.
     * @param {number} identifier - An unique identifier to create a test Feedback.
     * @returns {FeedbackBase} A Feedback with values that are base on the passed in identifier.
     */
    public static mockFeedbackNoId(identifier: string): FeedbackBase {
        const result = {} as FeedbackBase;

        // result.SSP_AppName = `Feedback Application name ${identifier}`;
        // result.issuelist = `Feedback Issuelist ${identifier}`;
        result.feedback_description = identifier;

        return result;
    }

    /**
     * Utility method for creating a Feedback for tests.
     * @param {number} identifier - An unique identifier to create a test Feedback.
     * @returns {Feedback} A Feedback with values that are base on the passed in identifier.
     */
    public static mockFeedbackWithId(identifier: string): Feedback {
        const result = this.mockFeedbackNoId(identifier) as Feedback;
        result.id = mockFeedbacksId();
        return result;
    }
}
