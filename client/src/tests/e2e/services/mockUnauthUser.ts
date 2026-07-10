import type { Page } from "@playwright/test";
import { ApiRoutes } from "@speak-up/shared";

const REFRESH_URL_PATTERN = `**${ApiRoutes.REFRESH}` as const;

async function mockUnauthUser(page: Page): Promise<void> {
  await page.route(REFRESH_URL_PATTERN, route =>
    route.fulfill({ status: 401, json: { message: "message" } }),
  );
}

export default mockUnauthUser;
