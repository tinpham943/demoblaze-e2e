// UI and API text the suite reads or asserts.
export const MESSAGES = {
  api: {
    userExists: 'This user already exist.',
    tokenMalformed: 'Bad parameter, token malformed.',
  },
  alerts: {
    fillLogin: 'Please fill out Username and Password.',
    wrongPassword: 'Wrong password.',
    userNotFound: 'User does not exist.',
    productAdded: 'Product added.',
    /** A guest gets the same alert WITHOUT the period (prod.js addToCart, guest branch). */
    productAddedGuest: 'Product added',
    fillOrder: 'Please fill out Name and Creditcard.',
  },
  nav: {
    toggle: 'Toggle navigation',
    welcome: (username: string): string => `Welcome ${username}`,
  },
  dialogs: {
    login: 'Log in',
    placeOrder: 'Place order',
  },
  buttons: {
    login: 'Log in',
    addToCart: 'Add to cart',
    placeOrder: 'Place Order',
    purchase: 'Purchase',
    ok: 'OK',
    delete: 'Delete',
  },
  cart: {
    heading: 'Products',
  },
  confirmation: {
    title: 'Thank you for your purchase!',
  },
} as const;
