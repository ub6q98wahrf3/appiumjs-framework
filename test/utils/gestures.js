/**
 * ============================================================================
 *  GESTURES  -  Reusable mobile-specific actions
 * ----------------------------------------------------------------------------
 *  Mobile testing has a whole class of operations that don't exist in web:
 *    - Swiping (up, down, left, right)
 *    - Scrolling until an element is found
 *    - Hiding the soft keyboard
 *    - Long press / pinch / zoom
 *    - Sending the app to background
 *
 *  We centralize these here so:
 *    1. Page Objects stay focused on "what" the page does
 *    2. The same gesture logic is reused across pages (DRY)
 *    3. If Appium changes its API (it does, often), we patch ONE file
 *
 *  These run on top of WebdriverIO's mobile API + Appium's W3C actions API.
 * ============================================================================
 */
import logger from './logger.js';
import { isAndroid, isIOS } from './platform.js';

/**
 * Swipe up by a percentage of the screen height.
 *
 * @param {number} percentage - 0..1 fraction of screen to swipe (default 0.5)
 */
export async function swipeUp(percentage = 0.5) {
    const { width, height } = await browser.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.8);
    const endY = Math.floor(height * (0.8 - percentage));
    logger.debug(`[gestures] swipeUp from (${startX},${startY}) to (${startX},${endY})`);
    await performSwipe(startX, startY, startX, endY);
}

/**
 * Swipe down by a percentage of screen height.
 */
export async function swipeDown(percentage = 0.5) {
    const { width, height } = await browser.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.2);
    const endY = Math.floor(height * (0.2 + percentage));
    logger.debug(`[gestures] swipeDown from (${startX},${startY}) to (${startX},${endY})`);
    await performSwipe(startX, startY, startX, endY);
}

/**
 * Swipe left.
 */
export async function swipeLeft(percentage = 0.5) {
    const { width, height } = await browser.getWindowSize();
    const startX = Math.floor(width * 0.8);
    const endX = Math.floor(width * (0.8 - percentage));
    const y = Math.floor(height / 2);
    logger.debug(`[gestures] swipeLeft from (${startX},${y}) to (${endX},${y})`);
    await performSwipe(startX, y, endX, y);
}

/**
 * Swipe right.
 */
export async function swipeRight(percentage = 0.5) {
    const { width, height } = await browser.getWindowSize();
    const startX = Math.floor(width * 0.2);
    const endX = Math.floor(width * (0.2 + percentage));
    const y = Math.floor(height / 2);
    logger.debug(`[gestures] swipeRight from (${startX},${y}) to (${endX},${y})`);
    await performSwipe(startX, y, endX, y);
}

/**
 * Scroll vertically until an element is visible.
 * Tries up to `maxSwipes` times before giving up.
 */
export async function scrollUntilVisible(elementGetter, maxSwipes = 8) {
    for (let i = 0; i < maxSwipes; i++) {
        const el = await elementGetter();
        const exists = await el.isExisting();
        if (exists && (await el.isDisplayed())) {
            logger.info(`[gestures] element found after ${i} swipe(s)`);
            return el;
        }
        await swipeUp(0.5);
    }
    throw new Error(`scrollUntilVisible: element not found after ${maxSwipes} swipes`);
}

/**
 * Hide the soft keyboard (no-op if it isn't visible).
 * Android exposes a direct API; iOS we tap outside.
 */
export async function hideKeyboard() {
    try {
        if (isAndroid()) {
            await browser.hideKeyboard();
            return;
        }
        if (isIOS()) {
            // iOS: tap a neutral area near the top
            const { width } = await browser.getWindowSize();
            await browser.touchAction({ action: 'tap', x: Math.floor(width / 2), y: 100 });
        }
    } catch (err) {
        logger.warn(`[gestures] hideKeyboard failed (likely not visible): ${err.message}`);
    }
}

/**
 * Send the app to background for `seconds`, then bring it forward.
 * Useful for testing app-resume / token-expiry flows.
 */
export async function sendToBackground(seconds = 3) {
    logger.info(`[gestures] sending app to background for ${seconds}s`);
    await browser.background(seconds);
}

// ---------------------------------------------------------------
// Internal: low-level W3C swipe
// ---------------------------------------------------------------
async function performSwipe(x1, y1, x2, y2) {
    await browser.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: x1, y: y1 },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerMove', duration: 600, x: x2, y: y2 },
                { type: 'pointerUp', button: 0 },
            ],
        },
    ]);
    await browser.releaseActions();
}
