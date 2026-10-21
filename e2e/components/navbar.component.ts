import type { Locator, Page } from '@playwright/test';
import { MESSAGES } from '@e2e/config/messages';
import { TID } from '@e2e/config/selectors';

/** The top navigation bar, present on every page. Collapses behind a toggler on narrow viewports. */
export class Navbar {
  readonly toggler: Locator;
  readonly cartLink: Locator;
  readonly loginLink: Locator;
  readonly logoutLink: Locator;
  /** "Welcome <username>" once signed in. */
  readonly welcome: Locator;

  constructor(private readonly page: Page) {
    this.toggler = page.getByRole('button', { name: MESSAGES.nav.toggle });
    this.cartLink = page.getByTestId(TID.nav.cart);
    this.loginLink = page.getByTestId(TID.nav.login);
    this.logoutLink = page.getByTestId(TID.nav.logout);
    this.welcome = page.getByTestId(TID.nav.welcome);
  }

  /** Opens the collapsed menu when the viewport hides it. */
  async expand(): Promise<void> {
    if ((await this.toggler.isVisible()) && !(await this.cartLink.isVisible())) {
      await this.toggler.click();
      await this.cartLink.waitFor({ state: 'visible' });
    }
  }

  async openLogin(): Promise<void> {
    await this.expand();
    await this.loginLink.click();
  }

  async openCart(): Promise<void> {
    await this.expand();
    await this.cartLink.click();
  }

  /**
   * The app's logOut() clears the cookie and then loads index.html, so this waits for that page. Acting before it
   * lands hits the page that is being left (e.g. a log-in modal that vanishes mid-fill).
   */
  async logout(): Promise<void> {
    await this.expand();
    const reloaded = this.page.waitForEvent('framenavigated', {
      predicate: (f) => f === this.page.mainFrame(),
    });
    await this.logoutLink.click();
    await reloaded;
    await this.page.waitForLoadState('domcontentloaded');
  }
}
