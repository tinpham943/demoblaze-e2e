import { test, expect } from '@e2e/fixtures/test';
import { MESSAGES } from '@e2e/config/messages';

test.describe('Cart', () => {
  test(
    'should list the product with its price when a signed-in user adds it to the cart',
    { tag: ['@smoke', '@cart', '@TC-CRT-001'] },
    async ({ productPage, navbar, cartPage, signedInUser, products: [product] }) => {
      await test.step('Given a signed-in user on a product page', async () => {
        await productPage.openById(product.id);
        await expect(productPage.title).toHaveText(product.title);
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(signedInUser.username));
      });

      const alert = await test.step('When they click Add to cart', async () => productPage.addToCart());

      await test.step('Then the app confirms and the cart shows one line with the product price', async () => {
        expect(alert).toBe(MESSAGES.alerts.productAdded);
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(1);
        await expect(cartPage.priceCell(cartPage.rowsOf(product.title))).toHaveText(String(product.price));
        await expect(cartPage.total).toHaveText(String(product.price));
      });
    },
  );

  test(
    'should sum the prices when several different products are in the cart',
    { tag: ['@regression', '@cart', '@TC-CRT-002'] },
    async ({ cartPage, cartSeeder, products }) => {
      await test.step('Given three different products in the cart', async () => {
        await cartSeeder(...products);
      });

      await test.step('When the cart is opened', async () => {
        await cartPage.open();
      });

      await test.step('Then each product has a line and the total is the sum of their prices', async () => {
        await expect(cartPage.rows).toHaveCount(products.length);
        for (const p of products) await expect(cartPage.rowsOf(p.title)).toHaveCount(1);
        await expect(cartPage.total).toHaveText(String(products.reduce((sum, p) => sum + p.price, 0)));
      });
    },
  );

  test(
    'should add a separate line when the same product is added twice',
    { tag: ['@regression', '@cart', '@TC-CRT-003'] },
    async ({ productPage, navbar, cartPage, signedInUser, products: [product] }) => {
      await test.step('Given a signed-in user on a product page', async () => {
        await productPage.openById(product.id);
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(signedInUser.username));
      });

      await test.step('When they click Add to cart twice', async () => {
        expect(await productPage.addToCart()).toBe(MESSAGES.alerts.productAdded);
        expect(await productPage.addToCart()).toBe(MESSAGES.alerts.productAdded);
      });

      await test.step('Then the cart shows two lines of it and twice its price', async () => {
        await cartPage.open();
        await expect(cartPage.rowsOf(product.title)).toHaveCount(2);
        await expect(cartPage.total).toHaveText(String(product.price * 2));
      });
    },
  );

  test(
    'should remove only that line and update the total when a product is deleted',
    { tag: ['@regression', '@cart', '@TC-CRT-004'] },
    async ({ cartPage, cartSeeder, products: [kept, removed] }) => {
      await test.step('Given two different products in the cart', async () => {
        await cartSeeder(kept, removed);
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(2);
      });

      await test.step(`When "${removed.title}" is deleted`, async () => {
        await cartPage.deleteOne(removed.title);
      });

      await test.step('Then only the other product remains and the total is its price', async () => {
        await expect(cartPage.rows).toHaveCount(1);
        await expect(cartPage.rowsOf(kept.title)).toHaveCount(1);
        await expect(cartPage.total).toHaveText(String(kept.price));
      });
    },
  );

  test(
    'should show an empty cart when the last product is deleted',
    { tag: ['@regression', '@cart', '@TC-CRT-006'] },
    async ({ cartPage, cartSeeder, products: [product] }) => {
      await test.step('Given one product in the cart', async () => {
        await cartSeeder(product);
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(1);
      });

      await test.step('When it is deleted', async () => {
        await cartPage.deleteOne(product.title);
      });

      await test.step('Then the cart has no lines and no total, also after reopening it', async () => {
        await expect(cartPage.rows).toHaveCount(0);
        await expect(cartPage.total).toHaveText('');
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(0);
      });
    },
  );

  test(
    'should keep the cart when the user reopens the page or logs out and back in',
    { tag: ['@regression', '@cart', '@TC-CRT-007'] },
    async ({ cartPage, navbar, loginModal, cartSeeder, signedInUser, products: [first, second] }) => {
      await test.step('Given a signed-in user with two products in the cart', async () => {
        await cartSeeder(first, second);
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(2);
      });

      await test.step('When they reopen the cart, then both products are still there', async () => {
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(2);
      });

      await test.step('When they log out and log back in, then both products are still there', async () => {
        await navbar.logout();
        await navbar.openLogin();
        await loginModal.login(signedInUser.username, signedInUser.password);
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(signedInUser.username));
        await cartPage.open();
        await expect(cartPage.rowsOf(first.title)).toHaveCount(1);
        await expect(cartPage.rowsOf(second.title)).toHaveCount(1);
        await expect(cartPage.total).toHaveText(String(first.price + second.price));
      });
    },
  );

  test(
    'should keep the guest cart apart from the account cart when a guest logs in',
    { tag: ['@regression', '@cart', '@TC-CRT-008'] },
    async ({ homePage, productPage, navbar, loginModal, cartPage, registeredUser, products: [product] }) => {
      await test.step('Given a guest who added a product to the cart', async () => {
        await homePage.open();
        await homePage.openProduct(product.title);
        expect(await productPage.addToCart()).toBe(MESSAGES.alerts.productAddedGuest);
      });

      await test.step('When they log in, then their account cart does not contain it', async () => {
        await navbar.openLogin();
        await loginModal.login(registeredUser.username, registeredUser.password);
        await expect(navbar.welcome).toHaveText(MESSAGES.nav.welcome(registeredUser.username));
        await cartPage.open();
        await expect(cartPage.rows).toHaveCount(0);
      });

      await test.step('When they log out, then the product is back in the guest cart', async () => {
        await navbar.logout();
        await expect(navbar.loginLink).toBeVisible();
        await cartPage.open();
        await expect(cartPage.rowsOf(product.title)).toHaveCount(1);
      });
    },
  );

  test(
    'should let a guest add a product to the cart',
    { tag: ['@regression', '@cart', '@TC-CRT-005'] },
    async ({ homePage, productPage, navbar, cartPage, products: [product] }) => {
      // From the home page, like a real visitor: it sets the guest cookie the guest cart is keyed by.
      await test.step('Given a visitor who is not signed in opens a product from the home page', async () => {
        await homePage.open();
        await expect(navbar.loginLink).toBeVisible();
        await homePage.openProduct(product.title);
        await expect(productPage.title).toHaveText(product.title);
      });

      const alert = await test.step('When they click Add to cart', async () => productPage.addToCart());

      await test.step('Then the product is in their cart', async () => {
        expect(alert).toBe(MESSAGES.alerts.productAddedGuest);
        await cartPage.open();
        await expect(cartPage.rowsOf(product.title)).toHaveCount(1);
        await expect(cartPage.total).toHaveText(String(product.price));
      });
    },
  );
});
