// Specs import { test, expect } from here and receive pages, API modules and test data as fixtures.
import { test as base, expect } from '@playwright/test';
import { newApiContext, RestClient } from '@e2e/api/client';
import { AuthApi } from '@e2e/api/modules/auth.api';
import { CartApi } from '@e2e/api/modules/cart.api';
import { ProductApi } from '@e2e/api/modules/product.api';
import { Navbar } from '@e2e/components/navbar.component';
import { PurchaseConfirmation } from '@e2e/components/purchase-confirmation.component';
import { env } from '@e2e/config/env';
import { buildOrder } from '@e2e/factories/order.factory';
import { buildUser } from '@e2e/factories/user.factory';
import { CartPage } from '@e2e/pages/cart.page';
import { HomePage } from '@e2e/pages/home.page';
import { LoginModal } from '@e2e/pages/login.modal';
import { PlaceOrderModal } from '@e2e/pages/place-order.modal';
import { ProductPage } from '@e2e/pages/product.page';
import type { OrderDetails, UserCredentials } from '@e2e/types/domain';
import type { Product } from '@e2e/types/schemas/product.schema';

type Fixtures = {
  // API
  restClient: RestClient;
  authApi: AuthApi;
  productApi: ProductApi;
  cartApi: CartApi;
  // Test data
  /** A freshly registered user (signed up through the API), not signed in. Its cart is emptied in teardown. */
  registeredUser: UserCredentials;
  /** A freshly registered user whose session is already in the browser (API log-in + the app's `tokenp_` cookie). */
  signedInUser: UserCredentials & { token: string };
  /** Puts products into the signed-in user's cart through the API. */
  cartSeeder: (...products: Product[]) => Promise<void>;
  /** The first three catalogue products (from the API). */
  products: readonly [Product, Product, Product];
  orderDetails: OrderDetails;
  // Pages and components
  navbar: Navbar;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginModal: LoginModal;
  placeOrderModal: PlaceOrderModal;
  purchaseConfirmation: PurchaseConfirmation;
};

export const test = base.extend<Fixtures>({
  restClient: async ({ playwright }, use) => {
    const ctx = await newApiContext(playwright.request);
    await use(new RestClient(ctx));
    await ctx.dispose();
  },
  authApi: async ({ restClient }, use) => {
    await use(new AuthApi(restClient));
  },
  productApi: async ({ restClient }, use) => {
    await use(new ProductApi(restClient));
  },
  cartApi: async ({ restClient }, use) => {
    await use(new CartApi(restClient));
  },

  registeredUser: async ({ authApi, cartApi }, use) => {
    const user = buildUser();
    await authApi.signup(user);
    await use(user);
    await cartApi.clear(user.username);
  },
  signedInUser: async ({ registeredUser, authApi, context }, use) => {
    const token = await authApi.token(registeredUser);
    await context.addCookies([{ name: 'tokenp_', value: token, url: env.BASE_URL }]);
    await use({ ...registeredUser, token });
  },
  cartSeeder: async ({ signedInUser, cartApi }, use) => {
    await use(async (...products) => {
      for (const product of products) await cartApi.add(signedInUser.token, product.id);
    });
  },
  products: async ({ productApi }, use) => {
    const [a, b, c] = await productApi.firstPage();
    if (!a || !b || !c) throw new Error('The catalogue needs at least 3 products');
    await use([a, b, c]);
  },
  orderDetails: async ({}, use) => {
    await use(buildOrder());
  },

  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  loginModal: async ({ page }, use) => {
    await use(new LoginModal(page));
  },
  placeOrderModal: async ({ page }, use) => {
    await use(new PlaceOrderModal(page));
  },
  purchaseConfirmation: async ({ page }, use) => {
    await use(new PurchaseConfirmation(page));
  },
});

export { expect };
