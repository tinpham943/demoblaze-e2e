import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Timing budgets run on their own: other tests sharing the CPU and the network skew the numbers, so `npm test` and
// the tag scripts never pick these specs up. One worker, so the two measurements don't overlap either.
export default defineConfig({
  ...base,
  workers: 1,
  fullyParallel: false,
  // A single network spike of the public demo can blow a budget. One retry absorbs it, and the report still lists
  // the test as "flaky", so a spike stays visible. A real regression fails both attempts.
  retries: 1,
  projects: [
    {
      name: 'perf',
      testMatch: /[/\\]tests[/\\]perf[/\\].+\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
