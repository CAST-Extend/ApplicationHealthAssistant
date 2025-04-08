// This file and standalone import statement is required by the angular test framework.
// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-preset-angular/setup-jest';

import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false },
});
