// Ceilings, not delays. The demo API answers in ~0.3–1 s, but cold starts reach several seconds.
export const TIMEOUTS = {
  action: 10_000,
  navigation: 30_000,
  expect: 10_000,
  test: 60_000,
  /** A window.alert raised after an API round trip (login errors, "Product added."). */
  alert: 10_000,
} as const;
