// UI paths (relative to BASE_URL) and REST endpoints (relative to API_URL).
export const ROUTES = {
  home: '/',
  product: (id: number): string => `/prod.html?idp_=${id}`,
  cart: '/cart.html',
} as const;

export const URL_PATTERNS = {
  home: /\/(index\.html)?$/,
  product: /\/prod\.html\?idp_=\d+$/,
  cart: /\/cart\.html$/,
} as const;

export const API_ROUTES = {
  signup: '/signup',
  login: '/login',
  entries: '/entries',
  addToCart: '/addtocart',
  viewCart: '/viewcart',
  deleteItem: '/deleteitem',
  deleteCart: '/deletecart',
} as const;
