import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '@e2e/config/routes';
import { TID } from '@e2e/config/selectors';
import { BasePage } from '@e2e/pages/base.page';

/** The store front. The product grid loads from /entries after the page itself. */
export class HomePage extends BasePage {
  protected readonly path = ROUTES.home;
  readonly root: Locator;
  readonly productGrid: Locator;
  readonly productTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.productGrid = page.getByTestId(TID.content);
    this.productTitles = this.productGrid.getByRole('heading').getByRole('link');
    this.root = this.productTitles.first();
  }

  productLink(title: string): Locator {
    return this.productGrid.getByRole('link', { name: title, exact: true });
  }

  async openProduct(title: string): Promise<void> {
    await this.productLink(title).click();
  }
}
