import { test, expect } from '@e2e/fixtures/test';
import { MESSAGES } from '@e2e/config/messages';
import { URL_PATTERNS } from '@e2e/config/routes';
import type { OrderDetails } from '@e2e/types/domain';

/** Required fields (Name, Credit card) left empty: the app must refuse the order. */
const REQUIRED_FIELDS: readonly { tc: string; field: keyof OrderDetails }[] = [
  { tc: 'ORD-002', field: 'name' },
  { tc: 'ORD-003', field: 'card' },
];

test.describe('Place order', () => {
  test(
    'should confirm the purchase with the cart total and empty the cart when the order is valid',
    { tag: ['@smoke', '@checkout', '@TC-ORD-001'] },
    async ({ page, cartPage, placeOrderModal, purchaseConfirmation, cartSeeder, orderDetails, products }) => {
      const [a, b] = products;
      const total = a.price + b.price;

      await test.step('Given a signed-in user with two products in the cart', async () => {
        await cartSeeder(a, b);
        await cartPage.open();
        await expect(cartPage.total).toHaveText(String(total));
      });

      await test.step('When they place the order with valid details', async () => {
        await cartPage.placeOrderButton.click();
        await expect(placeOrderModal.total).toHaveText(`Total: ${total}`);
        await placeOrderModal.purchase(orderDetails);
      });

      await test.step('Then the confirmation shows the cart total, the card and the name', async () => {
        await expect(purchaseConfirmation.title).toBeVisible();
        expect(await purchaseConfirmation.receipt()).toMatchObject({
          amount: total,
          currency: 'USD',
          cardNumber: orderDetails.card,
          name: orderDetails.name,
        });
      });

      await test.step('And OK returns to the store with an empty cart', async () => {
        await purchaseConfirmation.close();
        await expect(page).toHaveURL(URL_PATTERNS.home);
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(0);
      });
    },
  );

  for (const { tc, field } of REQUIRED_FIELDS) {
    test(
      `should refuse the order when the ${field} field is empty`,
      { tag: ['@regression', '@checkout', `@TC-${tc}`] },
      async ({
        cartPage,
        placeOrderModal,
        purchaseConfirmation,
        cartSeeder,
        orderDetails,
        products: [product],
      }) => {
        await test.step('Given a cart with one product and the Place order form open', async () => {
          await cartSeeder(product);
          await cartPage.open();
          await expect(cartPage.rows).toHaveCount(1);
          await cartPage.placeOrderButton.click();
        });

        const alert = await test.step(`When they click Purchase with an empty ${field}`, async () =>
          placeOrderModal.purchaseExpectingAlert({ ...orderDetails, [field]: '' }));

        await test.step('Then the app asks for the required fields and nothing is purchased', async () => {
          expect(alert).toBe(MESSAGES.alerts.fillOrder);
          await expect(placeOrderModal.root).toBeVisible();
          await expect(purchaseConfirmation.title).toBeHidden();
        });
      },
    );
  }
});

// Known product defects: `test.fail()` keeps the suite green while the defect exists and turns the test RED the day
// it is fixed, so the expectation is then updated deliberately.
test.describe('Place order — known defects', () => {
  test(
    'should refuse to place an order when the cart is empty',
    {
      tag: ['@regression', '@checkout', '@TC-ORD-004'],
      annotation: {
        type: 'issue',
        description: 'DemoBlaze confirms a purchase of "Amount: 0 USD" for an empty cart',
      },
    },
    async ({ cartPage, navbar, placeOrderModal, purchaseConfirmation, signedInUser, orderDetails }) => {
      test.fail();

      await test.step('Given a signed-in user with an empty cart', async () => {
        await cartPage.open();
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(signedInUser.username));
        await expect(cartPage.rows).toHaveCount(0);
      });

      await test.step('When they place an order with valid details', async () => {
        await cartPage.placeOrderButton.click();
        await placeOrderModal.purchase(orderDetails);
      });

      await test.step('Then no purchase is confirmed', async () => {
        await expect(purchaseConfirmation.title).toBeHidden({ timeout: 3_000 });
      });
    },
  );

  test(
    "should print today's date on the purchase confirmation",
    {
      tag: ['@regression', '@checkout', '@TC-ORD-005'],
      annotation: {
        type: 'issue',
        description: 'The date is one month behind (cart.js uses 0-based getMonth())',
      },
    },
    async ({
      cartPage,
      placeOrderModal,
      purchaseConfirmation,
      cartSeeder,
      orderDetails,
      products: [product],
    }) => {
      test.fail();
      // D/M/YYYY in UTC: playwright.config pins the browser time zone.
      const now = new Date();
      const today = `${now.getUTCDate()}/${now.getUTCMonth() + 1}/${now.getUTCFullYear()}`;

      await test.step('Given a cart with one product', async () => {
        await cartSeeder(product);
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(1);
      });

      await test.step('When the order is placed', async () => {
        await cartPage.placeOrderButton.click();
        await placeOrderModal.purchase(orderDetails);
      });

      await test.step("Then the confirmation shows today's date", async () => {
        expect((await purchaseConfirmation.receipt()).date).toBe(today);
      });
    },
  );
});
