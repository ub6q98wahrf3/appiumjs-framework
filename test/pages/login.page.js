/**
 * ============================================================================
 *  LoginPage  -  Page Object for the native app's Login screen
 * ----------------------------------------------------------------------------
 *  This file shows how INHERITANCE and POLYMORPHISM look in practice:
 *
 *    - `extends BasePage`  -> inherits tap, type, getText, screenshots,
 *                              logging, Allure steps - all for free.
 *    - `isLoaded()`        -> POLYMORPHIC override of the abstract parent
 *                              method; tells the framework what "loaded"
 *                              means for THIS page.
 *    - `loginAs()`         -> high-level business action. Specs read like
 *                              English, not like Appium calls.
 *
 *  ---- ABOUT THE TEST APP ----
 *  We target the open-source Sauce Labs Demo App (Android + iOS native).
 *  Selectors below use accessibility IDs that the app exposes the SAME
 *  on both platforms - the prefix `~` in WDIO means "by accessibility id".
 *
 *  Repository: https://github.com/saucelabs/sample-app-mobile
 *
 *  Sample valid credentials (shown ON the login screen of that app):
 *      username: bob@example.com
 *      password: 10203040
 * ============================================================================
 */

import BasePage from './base.page.js';
import { selectFor } from '../utils/platform.js';
import { hideKeyboard } from '../utils/gestures.js'; 
import logger from '../utils/logger.js';

class LoginPage extends BasePage {
    constructor() {
        super('LoginPage');
    }

    // -----------------------------------------------------------
    // SELECTORS (as getters - encapsulated, lazily resolved)
    //   Using `~` for accessibility ID (works on both platforms).
    //   For elements that differ per platform, use selectFor(...).
    // -----------------------------------------------------------

    /** Username input. Same a11y id on both platforms. */
    get usernameField() {
        return $('~test-Username');
    }

    /** Password input. Same a11y id on both platforms. */
    get passwordField() {
        return $('~test-Password');
    }

    /** Login button. */
    get loginButton() {
        return $('~test-LOGIN');
    }

    /** Generic error toast / message shown after a failed login. */
    get errorMessage() {
        return $('~test-Error message');
    }

    /**
     * Example of a per-platform selector (kept for reference even if
     * not strictly needed for this app):
     */
    get appLogo() {
        return $(
            selectFor({
                android: '//android.widget.ImageView[@content-desc="test-LOGO"]',
                ios: '~test-LOGO',
            })
        );
    }

    // ===========================================================
    // POLYMORPHIC METHOD - overriding BasePage.isLoaded()
    // ===========================================================
    async isLoaded() {
        await this.usernameField.waitForDisplayed({
            timeout: 20000,
            timeoutMsg: 'Login screen never appeared - app may not have launched',
        });
    }

    // ===========================================================
    // BUSINESS ACTIONS - what specs actually call
    // ===========================================================

    /**
     * High-level login. Accepts EITHER a `{username, password}` object
     * OR two strings - this is POLYMORPHISM at the method level.
     *
     * Specs read like:
     *      await LoginPage.loginAs(users.valid)
     *  or  await LoginPage.loginAs('bob@example.com', '10203040')
     */
    async loginAs(usernameOrUser, maybePassword) {
        let username;
        let password;

        if (typeof usernameOrUser === 'object' && usernameOrUser !== null) {
            username = usernameOrUser.username;
            password = usernameOrUser.password;
        } else {
            username = usernameOrUser;
            password = maybePassword;
        }

        logger.info(`[LoginPage] logging in as "${username}"`);

        await this.type(this.usernameField, username, 'Username field');
        await this.type(this.passwordField, password, 'Password field', { mask: true });

        // Mobile-only quirk: keyboard often covers the login button.
        await hideKeyboard();

        await this.tap(this.loginButton, 'Login button');
    }

    /**
     * Returns the error message text, if any.
     */
    async getErrorMessage() {
        return this.getText(this.errorMessage, 'Error message');
    }

    /**
     * Returns true if an error message is currently visible (no throw).
     */
    async isErrorDisplayed() {
        return this.isElementDisplayed(this.errorMessage, 5000);
    }
}

// Export a single shared instance - matches WDIO's POM convention.
export default new LoginPage();
