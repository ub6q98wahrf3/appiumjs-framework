/**
 * ============================================================================
 *  wdio.ios.conf.js  -  iOS run config (local development)
 * ----------------------------------------------------------------------------
 *  Imports the shared base config and OVERRIDES only what's specific to
 *  running on iOS: capabilities, app path, automation engine (XCUITest).
 *
 *  NOTE: iOS automation requires:
 *    - macOS host
 *    - Xcode + Command Line Tools installed
 *    - An iOS Simulator booted (or a real device with proper provisioning)
 * ============================================================================
 */
import { baseConfig } from './wdio.base.conf.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .app bundle (NOT .ipa) for simulator runs.
const iosAppPath =
    process.env.APP_PATH ||
    path.resolve(__dirname, '../apps/ios/SauceLabs-Demo-App.app');

export const config = {
    ...baseConfig,

    capabilities: [
        {
            platformName: 'iOS',
            'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.4',
            'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15',
            'appium:automationName': 'XCUITest',
            'appium:app': iosAppPath,
            'appium:bundleId': process.env.IOS_BUNDLE_ID || 'com.saucelabs.SwagLabsMobileApp',
            'appium:noReset': false,
            'appium:fullReset': false,
            'appium:newCommandTimeout': 240,
            'appium:wdaLaunchTimeout': 120000,
            'appium:wdaConnectionTimeout': 120000,
        },
    ],
};
