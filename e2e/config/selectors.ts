// DemoBlaze has no data-testid, but its element ids are stable. playwright.config sets `testIdAttribute: 'id'`,
// so these constants go through `getByTestId(TID.…)`.
export const TID = {
  nav: {
    cart: 'cartur',
    login: 'login2',
    logout: 'logout2',
    welcome: 'nameofuser',
  },
  login: {
    username: 'loginusername',
    password: 'loginpassword',
  },
  /** The product grid (home) and the product detail block (product page) share this id. */
  content: 'tbodyid',
  cart: {
    total: 'totalp',
  },
  order: {
    total: 'totalm',
    name: 'name',
    country: 'country',
    city: 'city',
    card: 'card',
    month: 'month',
    year: 'year',
  },
} as const;
