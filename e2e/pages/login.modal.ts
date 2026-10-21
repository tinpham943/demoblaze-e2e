import type { Locator, Page } from '@playwright/test';
import { acceptAlert } from '@e2e/components/native-alert';
import { MESSAGES } from '@e2e/config/messages';
import { TID } from '@e2e/config/selectors';

/** The "Log in" modal opened from the navbar. Errors come back as window.alert. */
export class LoginModal {
  readonly root: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('dialog', { name: MESSAGES.dialogs.login });
    this.usernameInput = page.getByTestId(TID.login.username);
    this.passwordInput = page.getByTestId(TID.login.password);
    this.submitButton = this.root.getByRole('button', { name: MESSAGES.buttons.login });
  }

  async fill(username: string, password: string): Promise<void> {
    // A click waits until the field is stable, i.e. the modal's open animation is over. Typing during the animation
    // lost the password on WebKit.
    await this.usernameInput.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(username, password);
    await this.submitButton.click();
  }

  /** Fills, submits and returns the alert the app raises (rejected log-in). */
  async loginExpectingAlert(username: string, password: string): Promise<string> {
    await this.fill(username, password);
    return acceptAlert(this.page, () => this.submitButton.click());
  }
}
