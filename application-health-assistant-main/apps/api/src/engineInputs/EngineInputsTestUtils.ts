import {
    EngineInputBase,
    EngineInput,
} from '@application-health-assistant/shared-api-model/model/engineInputs';

import mockEngineInputsId from './mockEngineInputsId';

/**
 * Testing utils for the local Jest tests.
 */
export default class EngineInputTestUtils {
    /**
     * Utility method for creating a EngineInput for tests.
     * @param {number} identifier - An unique identifier to create a test EngineInput.
     * @returns {EngineInputBase} A EngineInput with values that are base on the passed in identifier.
     */
    public static mockEngineInputNoId(identifier: []): EngineInputBase {
        const result = {} as EngineInputBase;

        // result.SSP_AppName = `EngineInput Application name ${identifier}`;
        // result.issuelist = `EngineInput Issuelist ${identifier}`;
        result.request = identifier;

        return result;
    }

    /**
     * Utility method for creating a EngineInput for tests.
     * @param {number} identifier - An unique identifier to create a test EngineInput.
     * @returns {EngineInput} A EngineInput with values that are base on the passed in identifier.
     */
    public static mockEngineInputWithId(identifier: []): EngineInput {
        const result = this.mockEngineInputNoId(identifier) as EngineInput;
        result.id = mockEngineInputsId();
        return result;
    }
}
