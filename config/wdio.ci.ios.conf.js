/**
 * ============================================================================
 *  wdio.ci.ios.conf.js  -  CI-tuned iOS config (macOS runner only)
 * ----------------------------------------------------------------------------
 */
import { config as iosConfig } from './wdio.ios.conf.js';

export const config = {
    ...iosConfig,

    maxInstances: 1, // iOS sims don't parallelize cleanly; keep at 1

    mochaOpts: {
        ...iosConfig.mochaOpts,
        timeout: 180000,
        retries: 1,
    },

    capabilities: [
        {
            ...iosConfig.capabilities[0],
            'appium:newCommandTimeout': 360,
            'appium:wdaLaunchTimeout': 240000,
            'appium:wdaConnectionTimeout': 240000,
        },
    ],
};
