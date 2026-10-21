import { test, expect } from '@e2e/fixtures/test';
import { PERF_BUDGETS, PERF_SAMPLES } from '@e2e/config/perf';

test.describe('Load time', () => {
  test(
    'should show the store within budget when a visitor opens the home page',
    { tag: ['@perf', '@TC-PRF-001'] },
    async ({ homePage }, testInfo) => {
      const productsVisible = await test.step('When a visitor opens the home page', async () => {
        const start = performance.now();
        await homePage.open();
        return performance.now() - start;
      });

      await test.step('Then DOMContentLoaded, load and the product grid are within budget', async () => {
        const timing = await homePage.navigationTiming();
        await testInfo.attach('timings-ms', {
          body: JSON.stringify({ ...timing, productsVisible }, null, 2),
          contentType: 'application/json',
        });
        expect.soft(timing.domContentLoaded).toBeLessThan(PERF_BUDGETS.homeDomContentLoaded);
        expect.soft(timing.load).toBeLessThan(PERF_BUDGETS.homeLoad);
        expect.soft(productsVisible).toBeLessThan(PERF_BUDGETS.homeProductsVisible);
      });
    },
  );

  test(
    'should answer the catalogue API within budget when it is called repeatedly',
    { tag: ['@perf', '@TC-PRF-002'] },
    async ({ productApi }, testInfo) => {
      const samples = await test.step(`When /entries is called ${PERF_SAMPLES} times in a row`, async () => {
        const times: number[] = [];
        for (let i = 0; i < PERF_SAMPLES; i++) {
          const start = performance.now();
          await productApi.firstPage();
          times.push(performance.now() - start);
        }
        return times.sort((a, b) => a - b);
      });

      await test.step('Then the median response time is within budget', async () => {
        const median = samples[Math.floor(samples.length / 2)] ?? Infinity;
        await testInfo.attach('timings-ms', {
          body: JSON.stringify({ median, samples }, null, 2),
          contentType: 'application/json',
        });
        expect(median).toBeLessThan(PERF_BUDGETS.catalogueApiMedian);
      });
    },
  );
});
