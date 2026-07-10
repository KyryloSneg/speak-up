import mockAuthUser from "@/tests/e2e/services/mockAuthUser";
import mockUnauthUser from "@/tests/e2e/services/mockUnauthUser";
import initGlobalPlaywrightStores from "@/tests/e2e/utils/initGlobalPlaywrightStores";
import { test } from "@/tests/e2e/utils/test";
import type { PlaywrightWindow } from "@/types/playwright";
import type { Room } from "@/types/room";
import { RoutesWithoutParams } from "@/types/routes";
import { expect } from "@playwright/test";

test.describe("Router auth guards", () => {
  test.beforeEach(async ({ page }) => await initGlobalPlaywrightStores(page));

  test.describe("Auth user", () => {
    test.beforeEach(async ({ page }) => await mockAuthUser(page));

    test.describe("socket connection", () => {
      test("should initialize socket connection after auth initialization", async ({
        page,
      }) => {
        await page.goto(RoutesWithoutParams.HOME);
        await expect(page).toHaveURL(RoutesWithoutParams.HOME);

        await expect
          .poll(async () => {
            return await page.evaluate(
              () =>
                (window as unknown as PlaywrightWindow).__socket__?.connected,
            );
          })
          .toBe(true);
      });

      test("should properly handle socket connection error after auth initialization", async ({
        page,
        mockServerIo,
      }) => {
        mockServerIo.setIsConnectError(true);

        await page.goto(RoutesWithoutParams.HOME);
        await expect(page).toHaveURL(RoutesWithoutParams.HOME);

        const toast = page.getByText("Failed to connect to socket");
        await expect(toast).toBeVisible();
      });

      test("should properly handle socket auth error after auth initialization (unexpired session)", async ({
        page,
        mockServerIo,
      }) => {
        mockServerIo.setIsConnectAuthError(true);

        await page.goto(RoutesWithoutParams.HOME);
        await expect(page).toHaveURL(RoutesWithoutParams.HOME);

        await expect
          .poll(async () => {
            return await page.evaluate(
              () =>
                (window as unknown as PlaywrightWindow).__socket__?.connected,
            );
          })
          .toBe(false);

        const toast = page.getByText("Failed to connect to socket");
        await expect(toast).not.toBeVisible();

        mockServerIo.setIsConnectAuthError(false);

        await expect
          .poll(async () => {
            return await page.evaluate(
              () =>
                (window as unknown as PlaywrightWindow).__socket__?.connected,
            );
          })
          .toBe(true);

        await expect(toast).not.toBeVisible();
      });

      test("should properly handle socket auth error after auth initialization (expired session)", async ({
        page,
        mockServerIo,
      }) => {
        await page.goto(RoutesWithoutParams.HOME);
        await expect(page).toHaveURL(RoutesWithoutParams.HOME);

        await mockUnauthUser(page);
        mockServerIo.setIsConnectAuthError(true);

        await page.evaluate(() => {
          const playwrightWindow = window as unknown as PlaywrightWindow;

          playwrightWindow.__socket__?.disconnect();
          playwrightWindow.__stores__?.socket?.connect?.();
        });

        await expect
          .poll(async () => {
            return await page.evaluate(
              () =>
                (window as unknown as PlaywrightWindow).__socket__?.connected,
            );
          })
          .toBe(false);

        const toast = page.getByText("Failed to connect to socket");

        await expect(toast).not.toBeVisible();
        await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
      });
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

    test("should navigate to the home route if user tries to access the room one when they haven't joined any", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.ROOM);
      await expect(page).toHaveURL(RoutesWithoutParams.HOME);
    });

    test("should clean up room state when user leaves room route", async ({
      page,
    }) => {
      // in this test we should utilize client-side router in order to not reset
      // pinia stores. use page.goto only once to initialize the stores
      await page.goto(RoutesWithoutParams.HOME);
      await expect(page).toHaveURL(RoutesWithoutParams.HOME);

      await page.evaluate(route => {
        const playwrightWindow = window as unknown as PlaywrightWindow;

        if (playwrightWindow.__stores__?.room) {
          playwrightWindow.__stores__.room.room = {
            id: "id",
          } as Room;
        }

        playwrightWindow.__router__?.push(route);
      }, RoutesWithoutParams.ROOM);

      await expect(page).toHaveURL(RoutesWithoutParams.ROOM);
      await page.evaluate(route => {
        (window as unknown as PlaywrightWindow).__router__?.push(route);
      }, RoutesWithoutParams.HOME);

      await expect(page).toHaveURL(RoutesWithoutParams.HOME);

      // assume that if room is null, the cleanup is successful. otherwise, if
      // we check each state individually it won't be an e2e test atp
      const isRoomNull = await page.evaluate(() => {
        const playwrightWindow = window as unknown as PlaywrightWindow;
        return playwrightWindow.__stores__?.room?.room === null;
      });

      expect(isRoomNull).toBe(true);
    });
  });

  test.describe("Unauth user", () => {
    test.beforeEach(async ({ page }) => await mockUnauthUser(page));

    test("should navigate to the sign in route if user tries to access the home one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.HOME);
      await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
    });

    test("should navigate to the sign in route if user tries to access the create room one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.CREATE_ROOM);
      await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
    });

    test("should navigate to the sign in route if user tries to access the room one", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.ROOM);
      await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
    });
  });
});
