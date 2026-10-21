// The challenge demo end to end, entirely through the UI: log in with valid credentials → add to cart → place order.
// Only the user's registration is seeded through the API.
import { test, expect } from '@e2e/fixtures/test';
import { MESSAGES } from '@e2e/config/messages';
import { URL_PATTERNS } from '@e2e/config/routes';

test.describe('Purchase journey', () => {
  test(
    'should complete a purchase when a user logs in, adds a product to the cart and places the order',
    { tag: ['@smoke', '@journey', '@TC-E2E-001'] },
    async ({
      page,
      homePage,
      productPage,
      navbar,
      loginModal,
      cartPage,
      placeOrderModal,
      purchaseConfirmation,
      registeredUser,
      orderDetails,
      products: [product],
    }) => {
      await test.step('Given a registered user logs in from the home page', async () => {
        await homePage.open();
        await navbar.openLogin();
        await loginModal.login(registeredUser.username, registeredUser.password);
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(registeredUser.username));
      });

      await test.step(`When they add "${product.title}" to the cart`, async () => {
        await homePage.openProduct(product.title);
        await expect(page).toHaveURL(URL_PATTERNS.product);
        await expect(productPage.title).toHaveText(product.title);
        expect(await productPage.addToCart()).toBe(MESSAGES.alerts.productAdded);
      });

      await test.step('And place the order from the cart', async () => {
        const cartRead = cartPage.waitForCartRead();
        await navbar.openCart();
        await cartRead;
        await expect(page).toHaveURL(URL_PATTERNS.cart);
        await expect(cartPage.rowsOf(product.title)).toHaveCount(1);
        await expect(cartPage.total).toHaveText(String(product.price));
        await cartPage.placeOrderButton.click();
        await placeOrderModal.purchase(orderDetails);
      });

      await test.step('Then the purchase is confirmed for the product price', async () => {
        await expect(purchaseConfirmation.title).toBeVisible();
        expect(await purchaseConfirmation.receipt()).toMatchObject({
          amount: product.price,
          currency: 'USD',
          name: orderDetails.name,
          cardNumber: orderDetails.card,
        });
        await purchaseConfirmation.close();
        await expect(page).toHaveURL(URL_PATTERNS.home);
      });
    },
  );
});
