import type { Locator, Page } from '@playwright/test';
import { acceptAlert } from '@e2e/components/native-alert';
import { MESSAGES } from '@e2e/config/messages';
import { TID } from '@e2e/config/selectors';
import type { OrderDetails } from '@e2e/types/domain';

/** The "Place order" modal opened from the cart. Missing required fields come back as window.alert. */
export class PlaceOrderModal {
  readonly root: Locator;
  /** "Total: 720". */
  readonly total: Locator;
  readonly fields: Record<keyof OrderDetails, Locator>;
  readonly purchaseButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('dialog', { name: MESSAGES.dialogs.placeOrder });
    this.total = page.getByTestId(TID.order.total);
    this.fields = {
      name: page.getByTestId(TID.order.name),
      country: page.getByTestId(TID.order.country),
      city: page.getByTestId(TID.order.city),
      card: page.getByTestId(TID.order.card),
      month: page.getByTestId(TID.order.month),
      year: page.getByTestId(TID.order.year),
    };
    this.purchaseButton = this.root.getByRole('button', { name: MESSAGES.buttons.purchase });
  }

  async fill(order: OrderDetails): Promise<void> {
    // A click waits for the modal's open animation to end (see LoginModal.fill).
    await this.fields.name.click();
    for (const [field, value] of Object.entries(order) as [keyof OrderDetails, string][]) {
      await this.fields[field].fill(value);
    }
  }

  async purchase(order: OrderDetails): Promise<void> {
    await this.fill(order);
    await this.purchaseButton.click();
  }

  /** Fills, purchases and returns the alert the app raises (rejected order). */
  async purchaseExpectingAlert(order: OrderDetails): Promise<string> {
    await this.fill(order);
    return acceptAlert(this.page, () => this.purchaseButton.click());
  }
}
