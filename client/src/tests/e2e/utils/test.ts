import { test as origTest } from "@playwright/test";

export const test = origTest.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      if ("startViewTransition" in document) {
        Object.defineProperty(document, "startViewTransition", {
          configurable: true,
          writable: true,
          value: (callback: () => void) => {
            callback();
            return {
              finished: Promise.resolve(),
              ready: Promise.resolve(),
              updateCallbackDone: Promise.resolve(),
            };
          },
        });
      }
    });

    await use(page);
  },
});
