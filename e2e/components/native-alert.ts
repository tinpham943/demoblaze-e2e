import type { Page } from '@playwright/test';
import { TIMEOUTS } from '@e2e/config/timeouts';

/**
 * Runs `action`, accepts the `window.alert` it raises and returns the alert text. DemoBlaze reports log-in errors,
 * "Product added." and order validation through native alerts. The listener is attached BEFORE the action and both run
 * concurrently: an alert left unhandled would block the page.
 */
export async function acceptAlert(page: Page, action: () => Promise<void>): Promise<string> {
  const [message] = await Promise.all([
    page.waitForEvent('dialog', { timeout: TIMEOUTS.alert }).then(async (dialog) => {
      const text = dialog.message();
      await dialog.accept();
      return text;
    }),
    action(),
  ]);
  return message;
}
