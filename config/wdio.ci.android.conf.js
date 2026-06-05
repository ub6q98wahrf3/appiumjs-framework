/**
 * ============================================================================
 *  wdio.ci.android.conf.js  -  CI-tuned Android config
 * ----------------------------------------------------------------------------
 *  Overrides the local Android config for CI execution:
 *    - Per-test retries (mobile is flaky in CI - retry once)
 *    - Higher launch timeouts (CI machines are slower)
 *    - More instances if the runner has them
 *    - SAFE defaults for headless emulators
 * ============================================================================
 */
import { config as androidConfig } from './wdio.android.conf.js';

export const config = {
    ...androidConfig,

    maxInstances: parseInt(process.env.MAX_INSTANCES || '1', 10),

    mochaOpts: {
        ...androidConfig.mochaOpts,
        timeout: 180000, // 3 min - CI emulators are slow
        retries: 1,      // retry once per test on CI
    },

    capabilities: [
        {
            ...androidConfig.capabilities[0],
            'appium:newCommandTimeout': 360,
            'appium:uiautomator2ServerInstallTimeout': 120000,
            'appium:androidInstallTimeout': 120000,
            'appium:appWaitDuration': 60000,
        },
    ],
};
