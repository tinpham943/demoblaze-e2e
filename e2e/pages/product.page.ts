import type { Locator, Page } from '@playwright/test';
import { acceptAlert } from '@e2e/components/native-alert';
import { MESSAGES } from '@e2e/config/messages';
import { API_ROUTES, ROUTES } from '@e2e/config/routes';
import { TID } from '@e2e/config/selectors';
import { BasePage } from '@e2e/pages/base.page';

/** Product detail page (`/prod.html?idp_=<id>`). */
export class ProductPage extends BasePage {
  protected path: string = ROUTES.home;
  readonly root: Locator;
  readonly title: Locator;
  /** "$360 *includes tax". */
  readonly price: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    const content = page.getByTestId(TID.content);
    this.title = content.getByRole('heading', { level: 2 });
    this.price = content.getByRole('heading', { level: 3 });
    this.addToCartButton = page.getByRole('link', { name: MESSAGES.buttons.addToCart });
    this.root = this.addToCartButton;
  }

  async openById(id: number): Promise<void> {
    this.path = ROUTES.product(id);
    await this.open();
  }

  /**
   * Clicks "Add to cart" and returns the alert text ("Product added."). Also waits for the cart write itself, so the
   * next step (e.g. opening the cart) cannot race it.
   */
  async addToCart(): Promise<string> {
    const saved = this.page.waitForResponse((r) => r.url().endsWith(API_ROUTES.addToCart));
    const message = await acceptAlert(this.page, () => this.addToCartButton.click());
    await saved;
    return message;
  }
}
