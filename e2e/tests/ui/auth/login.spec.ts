import { test, expect } from '@e2e/fixtures/test';
import { MESSAGES } from '@e2e/config/messages';
import { REJECTED_LOGIN_CASES } from '@e2e/test-data/static/login.cases';

test.describe('Log in', () => {
  test(
    'should greet the user by name when they log in with valid credentials',
    { tag: ['@smoke', '@auth', '@TC-LGN-001'] },
    async ({ homePage, navbar, loginModal, registeredUser }) => {
      await test.step('Given a registered user on the home page', async () => {
        await homePage.open();
        await expect(navbar.loginLink).toBeVisible();
      });

      await test.step('When they log in with their username and password', async () => {
        await navbar.openLogin();
        await loginModal.login(registeredUser.username, registeredUser.password);
      });

      await test.step('Then the navbar welcomes them and offers Log out', async () => {
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(registeredUser.username));
        await expect(loginModal.root).toBeHidden();
        await expect(navbar.logoutLink).toBeVisible();
        await expect(navbar.loginLink).toBeHidden();
      });
    },
  );

  for (const c of REJECTED_LOGIN_CASES) {
    test(
      `should reject the log-in when ${c.when}`,
      { tag: ['@regression', '@auth', `@TC-${c.tc}`] },
      async ({ homePage, navbar, loginModal, registeredUser }) => {
        await test.step('Given a registered user and the log-in modal open', async () => {
          await homePage.open();
          await navbar.openLogin();
        });

        const alert = await test.step(`When they submit and ${c.when}`, async () =>
          loginModal.loginExpectingAlert(c.username(registeredUser), c.password(registeredUser)));

        await test.step(`Then the app alerts "${c.alert}" and nobody is signed in`, async () => {
          expect(alert).toBe(c.alert);
          await expect(loginModal.root).toBeVisible();
          await expect(navbar.welcome).toBeHidden();
        });
      },
    );
  }
});

test.describe('Log in with surrounding spaces', () => {
  test(
    'should log the user in when the username has leading or trailing spaces',
    { tag: ['@regression', '@auth', '@TC-LGN-008'] },
    async ({ homePage, navbar, loginModal, registeredUser }) => {
      // Known defect: neither sign-up nor log-in trims the username, so " user " is refused here and can even be
      // registered as a second account that looks the same. The test passes while the defect exists.
      test.fail();

      await test.step('Given a registered user and the log-in modal open', async () => {
        await homePage.open();
        await navbar.openLogin();
      });

      await test.step('When they type their username with a space before and after it', async () => {
        await loginModal.login(` ${registeredUser.username} `, registeredUser.password);
      });

      await test.step('Then they are logged in as that user', async () => {
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(registeredUser.username));
      });
    },
  );
});

test.describe('Log out', () => {
  test(
    'should sign the user out when they click Log out',
    { tag: ['@regression', '@auth', '@TC-LGN-002'] },
    async ({ homePage, navbar, signedInUser }) => {
      await test.step('Given a signed-in user on the home page', async () => {
        await homePage.open();
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(signedInUser.username));
      });

      await test.step('When they click Log out', async () => {
        await navbar.logout();
      });

      await test.step('Then the navbar offers Log in again', async () => {
        await expect(navbar.loginLink).toBeVisible();
        await expect(navbar.welcome).toBeHidden();
      });
    },
  );
});
