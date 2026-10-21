import { test, expect } from '@e2e/fixtures/test';
import { MESSAGES } from '@e2e/config/messages';

test.describe('Cart API', () => {
  test(
    'should list every line when products are added to the cart',
    { tag: ['@regression', '@api', '@TC-API-006'] },
    async ({ authApi, cartApi, registeredUser, products }) => {
      const token = await test.step('Given a logged-in user', async () => authApi.token(registeredUser));

      await test.step('When two products are added through /addtocart', async () => {
        await cartApi.add(token, products[0].id);
        await cartApi.add(token, products[1].id);
      });

      await test.step('Then /viewcart lists both, owned by the user', async () => {
        const lines = await cartApi.view(token);
        expect(lines.map((l) => l.prod_id).sort()).toEqual([products[0].id, products[1].id].sort());
        expect(lines.every((l) => l.cookie === registeredUser.username)).toBe(true);
      });
    },
  );

  test(
    'should empty the cart when /deletecart is called',
    { tag: ['@regression', '@api', '@TC-API-007'] },
    async ({ authApi, cartApi, registeredUser, products }) => {
      const token = await test.step('Given a user with one product in the cart', async () => {
        const t = await authApi.token(registeredUser);
        await cartApi.add(t, products[0].id);
        return t;
      });

      await test.step('When /deletecart is called for the user', async () => {
        await cartApi.clear(registeredUser.username);
      });

      await test.step('Then /viewcart returns no lines', async () => {
        expect(await cartApi.view(token)).toEqual([]);
      });
    },
  );

  test(
    'should refuse to show a cart when the token is malformed',
    { tag: ['@regression', '@api', '@TC-API-008'] },
    async ({ cartApi }) => {
      await test.step('When /viewcart is called with a malformed token, then it is refused', async () => {
        await expect(cartApi.view('not-a-token')).rejects.toThrow(MESSAGES.api.tokenMalformed);
      });
    },
  );
});
