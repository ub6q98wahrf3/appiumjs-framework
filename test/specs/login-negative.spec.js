/**
 * ============================================================================
 *  DATA-DRIVEN LOGIN SPEC
 * ----------------------------------------------------------------------------
 *  Same logic + many data rows = many tests for free.
 *  Essential for boundary / equivalence testing.
 *
 *  When a new edge case is discovered (e.g., trailing space, very long
 *  password) - just append a row. NO new code, NO new file.
 * ============================================================================
 */
import { expect } from 'chai';
import LoginPage from '../pages/login.page.js';

const negativeCases = [
    {
        name: 'invalid username',
        username: 'unknown@example.com',
        password: '10203040',
        expectErrorContains: 'do not match',
    },
    {
        name: 'invalid password',
        username: 'bob@example.com',
        password: 'wrong_pass',
        expectErrorContains: 'do not match',
    },
    {
        name: 'both invalid',
        username: 'wrong@user.com',
        password: 'wrong_pass',
        expectErrorContains: 'do not match',
    },
    {
        name: 'locked-out user',
        username: 'alice@example.com',
        password: '10203040',
        expectErrorContains: 'locked',
    },
];

describe('Login - Data Driven Negative Tests', () => {
    negativeCases.forEach(({ name, username, password, expectErrorContains }) => {
        it(`@regression should fail login with ${name}`, async () => {
            await LoginPage.waitForPageLoad();
            await LoginPage.loginAs(username, password);

            const errorVisible = await LoginPage.isErrorDisplayed();
            expect(errorVisible).to.equal(true, `Expected an error message for: ${name}`);

            const errorText = await LoginPage.getErrorMessage();
            expect(errorText.toLowerCase()).to.include(expectErrorContains);
        });
    });
});
