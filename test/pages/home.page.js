/**
 * ============================================================================
 *  HomePage  -  the screen that appears AFTER a successful login
 * ----------------------------------------------------------------------------
 *  In the Sauce Labs Demo App, after login the user lands on the
 *  Products / Catalog screen. We treat this as our "home" page.
 *
 *  ---- WHAT THIS FILE DEMONSTRATES ----
 *
 *  1. INHERITANCE
 *     `extends BasePage` so we reuse tap, type, getText, screenshots, etc.
 *
 *  2. POLYMORPHISM
 *     Overrides `isLoaded()` with its own definition of "loaded".
 *
 *  3. COMPOSITION  (often better than inheritance for shared UI fragments)
 *     We don't say `HomePage extends MenuComponent` - we instantiate one
 *     as a property. HomePage HAS-A MenuComponent (vs IS-A).
 *     Reuse the menu on Products, Cart, Profile pages by composing it
 *     into each.
 *
 *  THIS IS THE PAGE THE LOGIN ASSERTIONS RUN AGAINST.
 * ============================================================================
 */

import BasePage from './base.page.js';
import MenuComponent from './components/menu.component.js';
import logger from '../utils/logger.js';

class HomePage extends BasePage {
    // COMPOSITION - HomePage HAS-A MenuComponent (vs IS-A)
    menu = new MenuComponent();

    constructor() {
        super('HomePage');
    }

    // -----------------------------------------------------------
    // Selectors
    // -----------------------------------------------------------

    /** The "PRODUCTS" header at the top of the catalog screen. */
    get productsTitle() {
        return $('~test-Cart');
        // ^ Cart is always visible on the products screen; it's a
        //   reliable anchor element. We use it instead of a fragile
        //   text selector for "PRODUCTS" which is locale-sensitive.
    }

    /** Container of the product list. */
    get productsList() {
        return $('~test-PRODUCTS');
    }

    /** All "ADD TO CART" buttons on this screen. */
    get addToCartButtons() {
        return $$('~test-ADD TO CART');
    }

    /** Cart badge / cart icon on the top right. */
    get cartIcon() {
        return $('~test-Cart');
    }

    // -----------------------------------------------------------
    // Polymorphic load check
    // -----------------------------------------------------------
    async isLoaded() {
        await this.productsTitle.waitForDisplayed({
            timeout: 20000,
            timeoutMsg: 'Home page (Products) did not load - cart icon never appeared',
        });
    }

    // -----------------------------------------------------------
    // Business actions / queries
    // -----------------------------------------------------------

    /**
     * Returns true once the Products screen anchor is visible.
     * Used by the login spec to assert successful login.
     */
    async isDisplayed() {
        return this.isElementDisplayed(this.productsTitle, 20000);
    }

    /**
     * Returns the count of "ADD TO CART" buttons - a reasonable proxy
     * for "products screen rendered N items".
     */
    async getProductCount() {
        const buttons = await this.addToCartButtons;
        const count = buttons.length;
        logger.debug(`[HomePage] product count = ${count}`);
        return count;
    }

    /**
     * Reads the logged-in username from the side menu (My Account section).
     * Wraps the composed component so the spec can ask the page directly.
     */
    async getLoggedInUsername() {
        await this.menu.open();
        const name = await this.menu.getLoggedInUsername();
        await this.menu.close();
        return name;
    }
}

export default new HomePage();
