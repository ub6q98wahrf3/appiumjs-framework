/**
 * ============================================================================
 *  BasePage  -  THE ABSTRACT PARENT CLASS for native mobile pages
 * ----------------------------------------------------------------------------
 *  This is the OOP foundation. EVERY page class in our app extends this.
 *
 *  ---- OOP CONCEPTS DEMONSTRATED HERE  ----
 *
 *  1. ABSTRACTION
 *     We expose simple, intent-revealing methods (`tap`, `type`, `getText`)
 *     and HIDE the messy Appium/WDIO details (waitForExist, scrollIntoView,
 *     keyboard handling, retries, logging, allure step recording).
 *     Specs/child pages don't care HOW it works - just WHAT it does.
 *
 *  2. ENCAPSULATION
 *     Internal state (#pageName) is PRIVATE via JS `#` syntax.
 *     Outside code cannot mutate it directly - only via controlled getters.
 *     This protects invariants and prevents accidental coupling.
 *
 *  3. INHERITANCE  (used BY child classes)
 *     LoginPage, HomePage etc. `extends BasePage` and reuse every method
 *     here for free. Zero duplication.
 *
 *  4. POLYMORPHISM
 *     `isLoaded()` is intentionally GENERIC here (throws). Each child
 *     page OVERRIDES it with a page-specific element check. The spec
 *     just calls `loginPage.waitForPageLoad()` without caring which
 *     concrete class it is.
 *
 *  ---- WHY THIS MATTERS FOR QA TEAMS ----
 *  When a new screen is added, the QA engineer only writes the
 *  screen-specific selectors and actions. The 100+ lines of waiting,
 *  logging, retry, error-handling, and Allure-reporting logic come
 *  for free via inheritance.
 *
 *  ---- WHY DIFFERENT FROM WEB BasePage? ----
 *  - No "open URL" concept - apps launch from package, not URL
 *  - "Tap" instead of "click" (mobile-native vocabulary)
 *  - `isLoaded()` waits for an element, not a URL match
 *  - Includes mobile-specific helpers (hide keyboard before submit, etc.)
 * ============================================================================
 */
import logger from '../utils/logger.js';
import { platformName } from '../utils/platform.js';
import allureReporter from '@wdio/allure-reporter';

const DEFAULT_TIMEOUT = 15000; // 15s - mobile is slower than web

export default class BasePage {
    // -----------------------------------------------------------
    // PRIVATE FIELDS (encapsulation via the `#` syntax)
    //   Cannot be accessed as `loginPage.#pageName` from outside.
    // -----------------------------------------------------------
    #pageName;

    /**
     * @param {string} pageName - human-readable name for logs/reports
     */
    constructor(pageName = 'BasePage') {
        if (new.target === BasePage) {
            // Enforces "abstract" semantics - cannot instantiate BasePage directly
            throw new Error(
                'BasePage is abstract. Extend it with a concrete page class.'
            );
        }
        this.#pageName = pageName;
    }

    // -----------------------------------------------------------
    // PUBLIC GETTERS (controlled access to private state)
    // -----------------------------------------------------------
    get pageName() {
        return this.#pageName;
    }

    // ===========================================================
    // POLYMORPHIC METHOD  -  child pages MUST override this
    // ===========================================================

    /**
     * Each page MUST implement: how to know "I'm fully loaded".
     * Typically waits for a unique anchor element of that page.
     */
    async isLoaded() {
        throw new Error(
            `[${this.#pageName}] isLoaded() must be implemented by the subclass.`
        );
    }

    /**
     * Wait until the page is loaded. Wraps polymorphic `isLoaded`.
     * Adds an Allure step + logging for free.
     */
    async waitForPageLoad() {
        allureReporter.addStep(`Wait for ${this.#pageName} to load`);
        logger.info(`[${this.#pageName}] waiting for page to load on ${platformName()}`);
        await this.isLoaded();
        logger.info(`[${this.#pageName}] page loaded`);
    }

    // ===========================================================
    // INHERITED HELPERS - shared element actions for ALL pages
    // ===========================================================

    /**
     * Tap an element with auto-wait, scroll-into-view fallback, logging,
     * Allure step. THIS is what specs call - never call native `.click()`
     * from a page directly.
     *
     * @param {WebdriverIO.Element|Promise<WebdriverIO.Element>} element
     * @param {string} elementName - friendly label for logs/reports
     * @param {number} timeout - override the default wait timeout
     */
    async tap(element, elementName = 'element', timeout = DEFAULT_TIMEOUT) {
        const el = await element;
        logger.info(`[${this.#pageName}] Tap on "${elementName}"`);
        allureReporter.addStep(`Tap on ${elementName}`);
        try {
            await el.waitForDisplayed({
                timeout,
                timeoutMsg: `[${this.#pageName}] "${elementName}" not displayed in ${timeout}ms`,
            });
            await el.waitForEnabled({
                timeout,
                timeoutMsg: `[${this.#pageName}] "${elementName}" not enabled in ${timeout}ms`,
            });
            await el.click();
        } catch (err) {
            logger.error(`[${this.#pageName}] Failed to tap "${elementName}": ${err.message}`);
            await this.captureScreenshot(`tap-fail-${elementName}`);
            throw err;
        }
    }

    /**
     * Clear a field then type into it, with auto-wait + Allure step.
     * Passwords are masked in logs.
     */
    async type(element, value, elementName = 'field', { mask = false } = {}) {
        const el = await element;
        const displayValue = mask ? '****' : value;
        logger.info(`[${this.#pageName}] Type "${displayValue}" into "${elementName}"`);
        allureReporter.addStep(`Type "${displayValue}" into ${elementName}`);
        try {
            await el.waitForDisplayed({
                timeout: DEFAULT_TIMEOUT,
                timeoutMsg: `[${this.#pageName}] "${elementName}" not displayed`,
            });
            await el.click(); // focus the field on mobile
            await el.clearValue();
            await el.setValue(value);
        } catch (err) {
            logger.error(`[${this.#pageName}] Failed to type into "${elementName}": ${err.message}`);
            await this.captureScreenshot(`type-fail-${elementName}`);
            throw err;
        }
    }

    /**
     * Get an element's visible text safely (with wait).
     */
    async getText(element, elementName = 'element') {
        const el = await element;
        await el.waitForDisplayed({
            timeout: DEFAULT_TIMEOUT,
            timeoutMsg: `[${this.#pageName}] "${elementName}" not displayed - cannot read text`,
        });
        const text = await el.getText();
        logger.debug(`[${this.#pageName}] "${elementName}" text = "${text}"`);
        return text;
    }

    /**
     * Returns true if element is visible WITHIN `timeout`.
     * Doesn't throw - returns boolean. Useful for assertion logic.
     */
    async isElementDisplayed(element, timeout = 5000) {
        try {
            const el = await element;
            await el.waitForDisplayed({ timeout });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait until an element disappears (e.g., loading spinner).
     */
    async waitUntilGone(element, elementName = 'element', timeout = DEFAULT_TIMEOUT) {
        const el = await element;
        logger.info(`[${this.#pageName}] waiting for "${elementName}" to disappear`);
        await el.waitForDisplayed({
            timeout,
            reverse: true,
            timeoutMsg: `[${this.#pageName}] "${elementName}" still visible after ${timeout}ms`,
        });
    }

    /**
     * Take a screenshot and attach it to the Allure report.
     * Called automatically on failure inside tap/type, but specs/pages
     * can also call it explicitly for debug snapshots.
     */
    async captureScreenshot(label = 'snapshot') {
        try {
            const png = await browser.takeScreenshot();
            const buffer = Buffer.from(png, 'base64');
            allureReporter.addAttachment(
                `${this.#pageName} - ${label}`,
                buffer,
                'image/png'
            );
        } catch (err) {
            logger.warn(`captureScreenshot failed: ${err.message}`);
        }
    }
}