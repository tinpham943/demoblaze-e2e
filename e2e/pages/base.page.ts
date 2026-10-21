import type { Locator, Page } from '@playwright/test';

/** A screen opened by its `path` (from ROUTES). Pages expose locators and state; specs assert. */
export abstract class BasePage {
  protected abstract readonly path: string;
  /** An element whose visibility proves the page is ready. */
  abstract readonly root: Locator;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  /** Navigation Timing of the current document (ms since the navigation started), read after the load event. */
  async navigationTiming(): Promise<{ domContentLoaded: number; load: number }> {
    await this.page.waitForLoadState('load');
    return this.page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (!nav) throw new Error('No navigation timing entry');
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
  }
}
