import { test, expect } from '@e2e/fixtures/test';

test.describe('Catalogue API', () => {
  test(
    'should list the first catalogue page when /entries is called',
    { tag: ['@smoke', '@api', '@TC-API-005'] },
    async ({ productApi }) => {
      // RestClient validates every product with Zod (id, title, price > 0, known category, image).
      const products = await test.step('When /entries is called', async () => productApi.firstPage());

      await test.step('Then it returns products, each listed once', async () => {
        expect(products.length).toBeGreaterThan(0);
        expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
      });
    },
  );
});
