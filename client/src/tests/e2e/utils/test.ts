import { createMockSocketServer } from "@/tests/e2e/services/socket";
import type { PlaywrightWindow } from "@/types/playwright";
import { test as origTest } from "@playwright/test";

export const test = origTest.extend<{
  mockServerIo: ReturnType<typeof createMockSocketServer>;
}>({
  page: async ({ page }, use, testInfo) => {
    const socketPort = 7000 + testInfo.parallelIndex;

    await page.addInitScript(socketPort => {
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

      (window as unknown as PlaywrightWindow).__MOCK_SOCKET_URL__ =
        `http://localhost:${socketPort}`;
    }, socketPort);

    await use(page);
  },
  mockServerIo: [
    async ({}, use, testInfo) => {
      const port = 7000 + testInfo.parallelIndex;

      const mockServer = createMockSocketServer(port);
      mockServer.listen();

      await use(mockServer);

      mockServer.reset();
      await mockServer.close();
    },
    { scope: "test", auto: true },
  ],
});
