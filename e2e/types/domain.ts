/** Product categories as the API names them (`cat`); the UI labels them Phones / Laptops / Monitors. */
export const CATEGORIES = ['phone', 'notebook', 'monitor'] as const;

/** A DemoBlaze account. The password is plain text here; the API layer encodes it the way the web app does. */
export type UserCredentials = { username: string; password: string };

/** The Place Order form. Name and credit card are required by the app; the rest is optional. */
export type OrderDetails = {
  name: string;
  country: string;
  city: string;
  card: string;
  month: string;
  year: string;
};

/** The purchase confirmation (SweetAlert) parsed into fields. */
export type Receipt = {
  id: string;
  amount: number;
  currency: string;
  cardNumber: string;
  name: string;
  /** As displayed: D/M/YYYY. */
  date: string;
};
