/**
 * ============================================================================
 *  MenuComponent  -  Side menu (hamburger) - reused across screens
 * ----------------------------------------------------------------------------
 *  This is a UI FRAGMENT that exists on multiple pages (Products, Cart,
 *  Profile, etc.). Instead of duplicating selectors+actions in every page
 *  class, we factor it out as a Component.
 *
 *  Pages then COMPOSE this component:
 *      class HomePage extends BasePage {
 *          menu = new MenuComponent();
 *          ...
 *      }
 *
 *  Composition over inheritance - because the menu is "part of" a page,
 *  not "a kind of" page.
 * ============================================================================
 */
import logger from '../../utils/logger.js';

export default class MenuComponent {
    // ---- selectors ----
    get menuButton() {
        return $('~test-Menu');
    }
    get logoutItem() {
        return $('~test-LOGOUT');
    }
    /** The "My Account" / username row inside the menu. */
    get usernameRow() {
        return $('~test-Username');
    }
    /** A close button on the menu drawer. */
    get closeMenuButton() {
        return $('~test-Close');
    }

    // ---- actions ----

    async open() {
        logger.info('[MenuComponent] opening side menu');
        const btn = await this.menuButton;
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
    }

    async close() {
        logger.info('[MenuComponent] closing side menu');
        try {
            const btn = await this.closeMenuButton;
            if (await btn.isDisplayed()) {
                await btn.click();
            }
        } catch {
            // best-effort; not all variants of the app expose a close btn
        }
    }

    async tapLogout() {
        logger.info('[MenuComponent] tapping logout');
        const btn = await this.logoutItem;
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
    }

    /**
     * Returns the username/email shown in the menu, if any.
     * Some app variants don't expose this - returns null in that case.
     */
    async getLoggedInUsername() {
        try {
            const row = await this.usernameRow;
            if (await row.isDisplayed()) {
                return await row.getText();
            }
        } catch {
            // ignored
        }
        return null;
    }
}
