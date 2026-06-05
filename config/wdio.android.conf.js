/**
 * ============================================================================
 *  wdio.android.conf.js  -  Android run config (local development)
 * ----------------------------------------------------------------------------
 *  Imports the shared base config and OVERRIDES only what's specific to
 *  running on Android: capabilities, app path, automation engine.
 * ============================================================================
 */
import { baseConfig } from './wdio.base.conf.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the .apk under apps/android/
// Override at runtime with APP_PATH=<absolute path>
const apkPath =
    process.env.APP_PATH ||
    path.resolve(__dirname, '../apps/android/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk');

export const config = {
    ...baseConfig,

    // ============================================================
    // Capabilities  -  one per parallel device.
    //   For local dev, point this at a running emulator / connected device.
    //   Use `adb devices` to check what's available.
    // ============================================================
    capabilities: [
        {
            // W3C-compliant Appium capabilities use the `appium:` prefix.
            platformName: 'Android',
            'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13.0',
            'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
            'appium:automationName': 'UiAutomator2',
            'appium:app': apkPath,
            'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'com.swaglabsmobileapp',
            'appium:appActivity': process.env.ANDROID_APP_ACTIVITY || '.MainActivity',
            'appium:autoGrantPermissions': true,
            'appium:noReset': false,         // start each session fresh
            'appium:fullReset': false,       // but don't reinstall every time
            'appium:newCommandTimeout': 240, // seconds before Appium kills idle session
            'appium:adbExecTimeout': 30000,
            'appium:uiautomator2ServerInstallTimeout': 60000,
            'appium:disableWindowAnimation': true, // critical for stable, fast runs
        },
    ],
};
