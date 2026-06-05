/**
 * ============================================================================
 *  PLATFORM HELPER  -  Cross-platform selector strategy
 * ----------------------------------------------------------------------------
 *  In native mobile automation, the SAME UI element often has DIFFERENT
 *  identifiers on Android vs iOS.
 *
 *    e.g., "Username field"
 *      Android  -> resource-id "com.swaglabsmobileapp:id/test-Username"
 *      iOS      -> accessibility id "test-Username"
 *
 *  This helper lets pages declare BOTH variants and the framework picks
 *  the right one at runtime based on the active platform.
 *
 *  Best practice: convince devs to use accessibility IDs that are IDENTICAL
 *  on both platforms - then you barely need this. But in the real world,
 *  you'll always have a few differences.
 *
 *  WHY A SEPARATE FILE?
 *    -> Keeps page objects clean (one selector line per element)
 *    -> Single source of truth for "which platform am I on?"
 *    -> Easy to extend later (tablet vs phone, web view vs native)
 * ============================================================================
 */

/**
 * Returns true if tests are running on Android.
 * Reads from the WDIO `browser` (driver) capabilities.
 */
export function isAndroid() {
    return browser.isAndroid;
}

/**
 * Returns true if tests are running on iOS.
 */
export function isIOS() {
    return browser.isIOS;
}

/**
 * Returns the platform-correct selector.
 *
 * @param {object} selectors - { android: '...', ios: '...' }
 * @returns {string} the selector for the current platform
 *
 * @example
 *   const usernameField = $(selectFor({
 *     android: '//*[@resource-id="test-Username"]',
 *     ios: '~test-Username'
 *   }));
 */
export function selectFor({ android, ios }) {
    if (isAndroid()) {
        if (!android) {
            throw new Error('selectFor: Android selector is required but missing.');
        }
        return android;
    }
    if (isIOS()) {
        if (!ios) {
            throw new Error('selectFor: iOS selector is required but missing.');
        }
        return ios;
    }
    throw new Error('selectFor: Unknown platform. Driver is neither Android nor iOS.');
}

/**
 * Returns the human-readable platform name (handy for logs/reports).
 */
export function platformName() {
    if (isAndroid()) return 'Android';
    if (isIOS()) return 'iOS';
    return 'Unknown';
}
