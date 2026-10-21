// Performance budgets (ms). Generous on purpose: the target is a shared public demo, so the checks catch regressions
// of seconds, not tens of milliseconds. Measured on 2026-10-20: /entries median ~0.3 s, home load event ~1.1 s,
// product grid visible ~1.3-2.3 s.
export const PERF_BUDGETS = {
  homeDomContentLoaded: 3_000,
  homeLoad: 6_000,
  homeProductsVisible: 6_000,
  catalogueApiMedian: 1_500,
} as const;

/** API calls timed per check; the median smooths out one slow call. */
export const PERF_SAMPLES = 5;
