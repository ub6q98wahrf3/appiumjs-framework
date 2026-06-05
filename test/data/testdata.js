/**
 * ============================================================================
 *  TEST DATA  -  centralized, environment-aware
 * ----------------------------------------------------------------------------
 *  Why a separate file?
 *    1. Data-driven tests just import this and iterate
 *    2. Updating a password = 1 file change, not 50
 *    3. Sensitive values can be overridden via env vars without touching code
 *    4. Different envs (dev/staging/prod) can use different fixtures
 *
 *  We layer values like this (highest priority first):
 *    1. Process env var (e.g., TEST_USERNAME) - set by CI/CD or shell
 *    2. Environment JSON file (config/staging.env.json etc.)
 *    3. Hard-coded fallback (the public Sauce demo credentials)
 * ============================================================================
 */

const env = global.envConfig || {};

export const users = {
    /** Standard valid user - used by happy-path tests. */
    valid: {
        username: process.env.TEST_USERNAME || env.users?.validUser?.username || 'bob@example.com',
        password: process.env.TEST_PASSWORD || env.users?.validUser?.password || '10203040',
        displayName: env.users?.validUser?.displayName || 'bob@example.com',
    },

    /** Wrong password - tests error path. */
    invalidPassword: {
        username: env.users?.validUser?.username || 'bob@example.com',
        password: 'WrongPassword!',
    },

    /** Wrong username - tests error path. */
    invalidUsername: {
        username: 'unknown@example.com',
        password: env.users?.validUser?.password || '10203040',
    },

    /** Locked-out user - tests business-rule error path. */
    locked: {
        username: 'alice@example.com',
        password: '10203040',
    },

    /** Empty credentials - tests required-field validation. */
    empty: {
        username: '',
        password: '',
    },
};

/** Expected error messages on the login page (parametrized for i18n later). */
export const messages = {
    invalidCredentials: 'Username and password do not match any user in this service.',
    lockedOut: 'Sorry, this user has been locked out.',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
};
