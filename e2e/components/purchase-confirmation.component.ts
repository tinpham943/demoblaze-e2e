import type { Locator, Page } from '@playwright/test';
import { MESSAGES } from '@e2e/config/messages';
import type { Receipt } from '@e2e/types/domain';

// SweetAlert's container class: a library contract, not a layout chain. The popup has no id and no dialog role.
const SWEET_ALERT = '.sweet-alert';
// SweetAlert adds `visible` when its open animation ends (~0.5 s). A click on OK before that closes the popup WITHOUT
// running the app's callback (no redirect to the store).
const SWEET_ALERT_READY = '.sweet-alert.visible';

/** The "Thank you for your purchase!" popup shown after a successful order. */
export class PurchaseConfirmation {
  readonly root: Locator;
  readonly title: Locator;
  /** The receipt paragraph: Id / Amount / Card Number / Name / Date, one per line. */
  readonly details: Locator;
  readonly okButton: Locator;
  /** The popup once it accepts clicks (see SWEET_ALERT_READY). */
  readonly ready: Locator;

  constructor(page: Page) {
    this.root = page.locator(SWEET_ALERT).filter({ visible: true });
    this.ready = page.locator(SWEET_ALERT_READY);
    this.title = this.root.getByRole('heading', { name: MESSAGES.confirmation.title });
    this.details = this.root.getByText(/^Id: /);
    this.okButton = this.root.getByRole('button', { name: MESSAGES.buttons.ok });
  }

  /** The receipt as fields. Waits for the popup first. */
  async receipt(): Promise<Receipt> {
    await this.details.waitFor({ state: 'visible' });
    const fields = new Map(
      (await this.details.innerText())
        .split('\n')
        .map((line) => line.split(/:\s(.*)/s))
        .map(([key, value]) => [key?.trim() ?? '', value?.trim() ?? ''] as const),
    );
    const [amount = '', currency = ''] = (fields.get('Amount') ?? '').split(' ');
    return {
      id: fields.get('Id') ?? '',
      amount: Number(amount),
      currency,
      cardNumber: fields.get('Card Number') ?? '',
      name: fields.get('Name') ?? '',
      date: fields.get('Date') ?? '',
    };
  }

  async close(): Promise<void> {
    await this.ready.waitFor({ state: 'visible' });
    await this.okButton.click();
  }
}
