import type { Locator, Page } from '@playwright/test';
import { MESSAGES } from '@e2e/config/messages';
import { API_ROUTES, ROUTES } from '@e2e/config/routes';
import { TID } from '@e2e/config/selectors';
import { BasePage } from '@e2e/pages/base.page';

/**
 * The cart (`/cart.html`). Lines load after the page: /viewcart, then one /view per line; the total is summed last.
 * Columns: Pic | Title | Price | Delete.
 */
export class CartPage extends BasePage {
  protected readonly path = ROUTES.cart;
  readonly root: Locator;
  readonly rows: Locator;
  readonly total: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.getByRole('heading', { name: MESSAGES.cart.heading });
    this.rows = page.getByTestId(TID.content).getByRole('row');
    this.total = page.getByTestId(TID.cart.total);
    this.placeOrderButton = page.getByRole('button', { name: MESSAGES.buttons.placeOrder });
  }

  /**
   * Waits for the cart read, not just the heading: an empty cart renders no rows, so "0 rows" would otherwise pass
   * before the lines arrive.
   */
  override async open(): Promise<void> {
    const cartRead = this.waitForCartRead();
    await super.open();
    await cartRead;
  }

  /** Same wait when the cart is reached through the navbar. */
  waitForCartRead(): Promise<unknown> {
    return this.page.waitForResponse((r) => r.url().endsWith(API_ROUTES.viewCart));
  }

  /** Every line of a product (the same product added twice = two lines). */
  rowsOf(title: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('cell', { name: title, exact: true }) });
  }

  /** The Price cell of a line (third column). */
  priceCell(row: Locator): Locator {
    return row.getByRole('cell').nth(2);
  }

  /** Deletes the first line of a product and waits until the table has re-rendered without it. */
  async deleteOne(title: string): Promise<void> {
    const before = await this.rows.count();
    const deleted = this.page.waitForResponse((r) => r.url().endsWith(API_ROUTES.deleteItem));
    await this.rowsOf(title).first().getByRole('link', { name: MESSAGES.buttons.delete }).click();
    await deleted;
    await this.rows.nth(before - 1).waitFor({ state: 'detached' });
  }
}
