import { defineConfig, devices } from '@playwright/test';
import { env } from './e2e/config/env';
import { TIMEOUTS } from './e2e/config/timeouts';

const UI_SPECS = /[/\\]tests[/\\]ui[/\\].+\.spec\.ts$/;
const API_SPECS = /[/\\]tests[/\\]api[/\\].+\.spec\.ts$/;
// tests/perf/ is not matched here: it runs alone through playwright.perf.config.ts (npm run test:perf).

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  // Every test owns its data (its own user), so tests are parallel-safe. Kept moderate: the target is a public demo.
  workers: env.WORKERS ?? (env.IS_CI ? 2 : 4),
  forbidOnly: env.IS_CI,
  // Fail fast locally (a retry hides flakes); CI tolerates transient hiccups of the public demo.
  retries: env.IS_CI ? 2 : 0,
  timeout: TIMEOUTS.test,
  expect: { timeout: TIMEOUTS.expect },
  outputDir: 'test-results',
  // On CI each project runs in its own job and writes a blob; a later job merges the blobs into one HTML report
  // (.github/workflows/e2e.yml).
  reporter: [
    [env.IS_CI ? 'github' : 'list'],
    env.IS_CI
      ? ['blob', { outputDir: 'reports/blob' }]
      : ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: env.BASE_URL,
    // DemoBlaze has no data-testid; its element ids are the stable hooks (see e2e/config/selectors.ts).
    testIdAttribute: 'id',
    headless: !env.HEADED,
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
    // Recorded on the retry of a failed test only. Recording on every first attempt hit ENOENT on the trace files on
    // Windows (WebKit). For a trace of a local run (no retries): npx playwright test --trace on.
    trace: env.ARTIFACTS.trace ? 'on-first-retry' : 'off',
    screenshot: env.ARTIFACTS.screenshot ? 'only-on-failure' : 'off',
    video: env.ARTIFACTS.video ? 'retain-on-failure' : 'off',
    // The purchase confirmation prints the browser's local date: pin the zone so expectations are deterministic.
    timezoneId: 'UTC',
  },
  projects: [
    { name: 'chromium', testMatch: UI_SPECS, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: UI_SPECS, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: UI_SPECS, use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', testMatch: UI_SPECS, grep: /@smoke/, use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', testMatch: UI_SPECS, grep: /@smoke/, use: { ...devices['iPhone 15'] } },
    // API tests use only the request fixtures, so no browser is launched.
    { name: 'api', testMatch: API_SPECS },
  ],
});
