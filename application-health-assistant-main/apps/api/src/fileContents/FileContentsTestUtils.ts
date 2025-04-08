import {
    FileContentBase,
    FileContent,
} from '@application-health-assistant/shared-api-model/model/fileContents';

import mockFileContentsId from './mockFileContentsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class FileContentTestUtils {
    /**
     * Utility method for creating a FileContent for tests.
     * @param {number} identifier - An unique identifier to create a test FileContent.
     * @returns {FileContentBase} A FileContent with values that are base on the passed in identifier.
     */
    public static mockFileContentNoId(identifier: number): FileContentBase {
        const result = {} as FileContentBase;

        // result.SSP_AppName = `FileContent Application name ${identifier}`;
        // result.issuelist = `FileContent Issuelist ${identifier}`;
        result.id = identifier;

        return result;
    }

    /**
     * Utility method for creating a FileContent for tests.
     * @param {number} identifier - An unique identifier to create a test FileContent.
     * @returns {FileContent} A FileContent with values that are base on the passed in identifier.
     */
    public static mockFileContentWithId(identifier: number): FileContent {
        const result = this.mockFileContentNoId(identifier) as FileContent;
        result.id = mockFileContentsId();
        return result;
    }
}
