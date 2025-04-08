import {
    IssueDetailBase,
    IssueDetail,
} from '@application-health-assistant/shared-api-model/model/issueDetails';

import mockIssueDetailsId from './mockIssueDetailsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class IssueDetailTestUtils {
    /**
     * Utility method for creating a IssueDetail for tests.
     * @param {number} identifier - An unique identifier to create a test IssueDetail.
     * @returns {IssueDetailBase} A IssueDetail with values that are base on the passed in identifier.
     */
    public static mockIssueDetailNoId(identifier: number): IssueDetailBase {
        const result = {} as IssueDetailBase;

        result.issueId = `IssueDetail Applicationname ${identifier}`;
        // result.issuelist = `IssueDetail Issuelist ${identifier}`;
        // result.issueId = identifier;

        return result;
    }

    /**
     * Utility method for creating a IssueDetail for tests.
     * @param {number} identifier - An unique identifier to create a test IssueDetail.
     * @returns {IssueDetail} A IssueDetail with values that are base on the passed in identifier.
     */
    public static mockIssueDetailWithId(identifier: number): IssueDetail {
        const result = this.mockIssueDetailNoId(identifier) as IssueDetail;
        result.id = mockIssueDetailsId();
        return result;
    }
}
