import {
    PullRequestLogBase,
    PullRequestLog,
} from '@application-health-assistant/shared-api-model/model/pullRequestLogs';

import mockPullRequestLogsId from './mockPullRequestLogsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class PullRequestLogTestUtils {
    /**
     * Utility method for creating a PullRequestLog for tests.
     * @param {number} identifier - An unique identifier to create a test PullRequestLog.
     * @returns {PullRequestLogBase} A PullRequestLog with values that are base on the passed in identifier.
     */
    public static mockPullRequestLogNoId(identifier: string): PullRequestLogBase {
        const result = {} as PullRequestLogBase;

        // result.SSP_AppName = `PullRequestLog Application name ${identifier}`;
        // result.issuelist = `PullRequestLog Issuelist ${identifier}`;
        result.applicationId = identifier;

        return result;
    }

    /**
     * Utility method for creating a PullRequestLog for tests.
     * @param {number} identifier - An unique identifier to create a test PullRequestLog.
     * @returns {PullRequestLog} A PullRequestLog with values that are base on the passed in identifier.
     */
    public static mockPullRequestLogWithId(identifier: string): PullRequestLog {
        const result = this.mockPullRequestLogNoId(identifier) as PullRequestLog;
        result.id = mockPullRequestLogsId();
        return result;
    }
}
