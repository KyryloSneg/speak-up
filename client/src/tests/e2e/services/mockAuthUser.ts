import { mockUser } from "@/tests/utils/consts";
import type { Page } from "@playwright/test";
import { ApiRoutes } from "@speak-up/shared";

const REFRESH_URL_PATTERN = `**${ApiRoutes.REFRESH}` as const;

async function mockAuthUser(page: Page): Promise<void> {
  await page.route(REFRESH_URL_PATTERN, route =>
    route.fulfill({
      status: 200,
      json: {
        user: mockUser,
        tokens: {
          accessToken: "accessToken",
          refreshToken: "refreshToken",
        },
      },
    }),
  );
}

export default mockAuthUser;
