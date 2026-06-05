/**
 * ============================================================================
 *  wdio.base.conf.js  -  shared WDIO config for ALL run modes
 * ----------------------------------------------------------------------------
 *  Mode-specific configs (wdio.android.conf.js, wdio.ios.conf.js, ci.*) extend
 *  this and override only what they need to.
 * ============================================================================
 */

import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//dotenv reads your .env file and populate its values into process.env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Load environment-specific data (dev/staging/prod) ----
const envName = process.env.TEST_ENV || 'staging';
const envFile = path.join(__dirname, `${envName}.env.json`);

if (!existsSync(envFile)) {
    throw new Error(
        `Environment config file not found: ${envFile}. ` +
        `Set TEST_ENV to one of: dev, staging, prod`
    );
}

const envConfig = JSON.parse(readFileSync(envFile, 'utf-8'));

// Expose env data globally so pages/specs/data files can read it without re-importing.
global.envConfig = envConfig;

export const baseConfig = {
    // ============================================================
    // Runner Configuration
    // ============================================================
    runner: 'local',

    // ============================================================
    // Specs & exclusions
    // ============================================================
    specs: ['../test/specs/**/*.spec.js'],
    exclude: [],

    // Suites let you do: `wdio run ... --suite smoke`
    suites: {
        smoke: ['../test/specs/login.spec.js'],
        regression: ['../test/specs/**/*.spec.js'],
        login: ['../test/specs/login*.spec.js'],
    },

    // ============================================================
    // Parallelism
    //   On real devices / emulators, parallel must match the number of
    //   simultaneously connected devices. Default to 1 to be safe.
    // ============================================================
    maxInstances: parseInt(process.env.MAX_INSTANCES || '1', 10),

    // ============================================================
    // Test framework
    // ============================================================
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000, // 2 min per test - mobile launch can be slow
        retries: 0,      // global; we also do per-test retry below
    },

    // ============================================================
    // Logging
    // ============================================================
    logLevel: process.env.WDIO_LOG_LEVEL || 'info',
    bail: 0,
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    // ============================================================
    // Services - Appium auto-starts
    // ============================================================
    services: [
        [
            'appium',
            {
                // Auto-start an Appium server before tests
                args: {
                    address: '127.0.0.1',
                    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
                    relaxedSecurity: true,
                    logLevel: 'warn',
                },
                command: 'appium',
            },
        ],
    ],

    // The Appium service starts the server on this port; tell WDIO too.
    hostname: '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/',

    // ============================================================
    // Reporters
    //   - spec   -> friendly terminal output
    //   - allure -> rich HTML report w/ steps + screenshots
    //   - junit  -> machine-readable XML for Jenkins / Azure DevOps
    // ============================================================
    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'reports/allure-results',
                disableWebdriverStepsReporting: false,
                disableWebdriverScreenshotsReporting: false,
                useCucumberStepReporter: false,
            },
        ],
        [
            'junit',
            {
                outputDir: 'reports/junit',
                outputFileFormat(options) {
                    return `results-${options.cid}.xml`;
                },
            },
        ],
    ],

    // ============================================================
    // Hooks  -  per-test lifecycle handlers
    //   Most importantly: failure screenshots auto-attached to Allure.
    // ============================================================
    afterTest: async function (test, context, { error, passed }) {
        if (!passed) {
            try {
                const png = await browser.takeScreenshot();
                const buf = Buffer.from(png, 'base64');
                const allure = (await import('@wdio/allure-reporter')).default;
                allure.addAttachment(
                    `Failure - ${test.title}`,
                    buf,
                    'image/png'
                );
            } catch (e) {
                // ignore - never let a screenshot failure mask the real error
            }
        }
    },
};
