/**
 * ============================================================================
 *  LOGIN SPEC  -  main login tests
 * ----------------------------------------------------------------------------
 *  Notice what's HERE vs what's NOT here:
 *
 *    HERE:  describe / it blocks, expect() assertions, test orchestration
 *    NOT HERE: any selector, any waitForX call, any try/catch, any tap/type
 *
 *  Specs read like specifications written for stakeholders, not code.
 *  This is the WHOLE POINT of the Page Object Model.
 *
 *  TAGGING: `@smoke`, `@regression` etc. let you run subsets via:
 *      npm run test:android -- --mochaOpts.grep @smoke
 * ============================================================================
 */
import { expect } from 'chai';

import LoginPage from '../pages/login.page.js';
import HomePage from '../pages/home.page.js';
import { users, messages } from '../data/testdata.js';

describe('Login - Native App', () => {
    beforeEach(async () => {
        // Each test gets a fresh app state via reset (configured in caps).
        await LoginPage.waitForPageLoad();
    });

    it('@smoke @regression should login with valid credentials and reach the home screen', async () => {
        // ACTION (business-level call, no selectors visible)
        await LoginPage.loginAs(users.valid);

        // Wait for the next screen
        await HomePage.waitForPageLoad();

        // ---- ASSERTIONS (live in the spec, NOT in the page object) ----
        const onHome = await HomePage.isDisplayed();
        expect(onHome).to.equal(true, 'Expected to land on Home/Products screen after valid login');

        const productCount = await HomePage.getProductCount();
        expect(productCount).to.be.greaterThan(0, 'Products list should be populated after login');
    });

    it('@regression should show an error for invalid password', async () => {
        await LoginPage.loginAs(users.invalidPassword);

        const errorVisible = await LoginPage.isErrorDisplayed();
        expect(errorVisible).to.equal(true, 'Error message should appear for invalid password');

        const errorText = await LoginPage.getErrorMessage();
        expect(errorText).to.include('do not match');
    });

    it('@regression should show an error for invalid username', async () => {
        await LoginPage.loginAs(users.invalidUsername);

        const errorVisible = await LoginPage.isErrorDisplayed();
        expect(errorVisible).to.equal(true, 'Error message should appear for invalid username');
    });

    it('@regression should show locked-out error for a locked user', async () => {
        await LoginPage.loginAs(users.locked);

        const errorVisible = await LoginPage.isErrorDisplayed();
        expect(errorVisible).to.equal(true, 'Locked-user error should be visible');

        const errorText = await LoginPage.getErrorMessage();
        expect(errorText.toLowerCase()).to.include('locked');
    });
});
