import { test, expect } from '@e2e/fixtures/test';
import { MESSAGES } from '@e2e/config/messages';

test.describe('Auth API', () => {
  test(
    'should return a working session token when the credentials are valid',
    { tag: ['@smoke', '@api', '@TC-API-001'] },
    async ({ authApi, cartApi, registeredUser }) => {
      const token = await test.step('When the registered user logs in through /login', async () =>
        authApi.token(registeredUser));

      await test.step('Then the token is accepted by /viewcart (an empty cart)', async () => {
        expect(await cartApi.view(token)).toEqual([]);
      });
    },
  );

  test(
    'should refuse the sign-up when the username is taken',
    { tag: ['@regression', '@api', '@TC-API-002'] },
    async ({ authApi, registeredUser }) => {
      await test.step('When the same username signs up again, then /signup refuses it', async () => {
        await expect(authApi.signup(registeredUser)).rejects.toThrow(MESSAGES.api.userExists);
      });
    },
  );

  test(
    'should refuse the log-in when the password is wrong',
    { tag: ['@regression', '@api', '@TC-API-003'] },
    async ({ authApi, registeredUser }) => {
      await test.step('When the user logs in with a wrong password, then /login refuses it', async () => {
        await expect(authApi.token({ ...registeredUser, password: 'not-the-password' })).rejects.toThrow(
          MESSAGES.alerts.wrongPassword,
        );
      });
    },
  );

  test(
    'should refuse the log-in when the user is not registered',
    { tag: ['@regression', '@api', '@TC-API-004'] },
    async ({ authApi, registeredUser }) => {
      await test.step('When an unregistered username logs in, then /login refuses it', async () => {
        await expect(
          authApi.token({ ...registeredUser, username: `${registeredUser.username}_x` }),
        ).rejects.toThrow(MESSAGES.alerts.userNotFound);
      });
    },
  );
});
