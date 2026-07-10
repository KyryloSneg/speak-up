import type { PlaywrightWindow } from "@/types/playwright";
import type { Page } from "@playwright/test";

async function initGlobalPlaywrightStores(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as PlaywrightWindow).__PLAYWRIGHT_TEST__ = true;
  });
}

export default initGlobalPlaywrightStores;
