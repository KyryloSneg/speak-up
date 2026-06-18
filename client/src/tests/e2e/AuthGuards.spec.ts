import { test } from "@/tests/e2e/utils/test";
import { RoutesWithoutParams } from "@/types/routes";
import { expect } from "@playwright/test";
import { ApiRoutes } from "@speak-up/shared";

const REFRESH_URL_PATTERN = `**${ApiRoutes.REFRESH}` as const;

test.describe("Router auth guards", () => {
  test.describe("Auth user", () => {
    test.beforeEach(async ({ page }) => {
      await page.route(REFRESH_URL_PATTERN, route =>
        route.fulfill({
          status: 200,
          json: {
            user: { id: "id" },
            tokens: {
              accessToken: "accessToken",
              refreshToken: "refreshToken",
            },
          },
        }),
      );
    });

    test("should navigate to the home route if user tries to access the register one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.REGISTER);
      await expect(page).toHaveURL(RoutesWithoutParams.HOME);
    });

    test("should navigate to the home route if user tries to access the sign in one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.SIGN_IN);
      await expect(page).toHaveURL(RoutesWithoutParams.HOME);
    });
  });

  test.describe("Unauth user", () => {
    test.beforeEach(async ({ page }) => {
      await page.route(REFRESH_URL_PATTERN, route =>
        route.fulfill({ status: 401, json: { message: "message" } }),
      );
    });

    test("should navigate to the sign in route if user tries to access the home one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.HOME);
      await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
    });

    test("should navigate to the sign in route if user tries to access the room one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.ROOM + "roomId");
      await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
    });
  });
});
