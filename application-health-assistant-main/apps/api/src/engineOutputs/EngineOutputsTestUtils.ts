import {
    EngineOutputBase,
    EngineOutput,
} from '@application-health-assistant/shared-api-model/model/engineOutputs';

import mockEngineOutputsId from './mockEngineOutputsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class EngineOutputTestUtils {
    /**
     * Utility method for creating a EngineOutput for tests.
     * @param {number} identifier - An unique identifier to create a test EngineOutput.
     * @returns {EngineOutputBase} A EngineOutput with values that are base on the passed in identifier.
     */
    public static mockEngineOutputNoId(identifier: string): EngineOutputBase {
        const result = {} as EngineOutputBase;

        // result.SSP_AppName = `EngineOutput Application name ${identifier}`;
        // result.issuelist = `EngineOutput Issuelist ${identifier}`;
        result.applicationid = identifier;

        return result;
    }

    /**
     * Utility method for creating a EngineOutput for tests.
     * @param {number} identifier - An unique identifier to create a test EngineOutput.
     * @returns {EngineOutput} A EngineOutput with values that are base on the passed in identifier.
     */
    public static mockEngineOutputWithId(identifier: string): EngineOutput {
        const result = this.mockEngineOutputNoId(identifier) as EngineOutput;
        result.id = mockEngineOutputsId();
        return result;
    }
}
