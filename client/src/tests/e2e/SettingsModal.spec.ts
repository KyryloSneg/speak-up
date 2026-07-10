import mockAuthUser from "@/tests/e2e/services/mockAuthUser";
import setupE2EFakeBrowserMediaEngine from "@/tests/e2e/services/setupE2EFakeBrowserMediaEngine";
import { test } from "@/tests/e2e/utils/test";
import { mockUser } from "@/tests/utils/consts";
import { RoutesWithoutParams } from "@/types/routes";
import { expect, type Locator } from "@playwright/test";
import { ApiRoutes } from "@speak-up/shared";

test.describe("SettingsModal", () => {
  let settingsButton: Locator;
  let dialog: Locator;

  test.beforeEach(async ({ page }) => {
    await setupE2EFakeBrowserMediaEngine(page, { failMicrophone: true });

    await mockAuthUser(page);
    await page.goto(RoutesWithoutParams.HOME);

    settingsButton = page
      .locator('button[aria-label*="Open settings"]')
      .first();

    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
  });

  test("should switch tab to 'Audio' and show disabled audio meter if the mic permission is denied", async () => {
    const audioTabButton = dialog.getByRole("tab", {
      name: "Audio",
      exact: true,
    });

    await audioTabButton.click();
    const audioMeter = dialog.locator('[aria-label*="Microphone input level"]');

    await expect(audioMeter).toBeVisible();
    await expect(audioMeter).toHaveAttribute("aria-disabled", "true");
  });

  test("should switch tab to 'General' and properly handle nickname validation and updates", async ({
    page,
  }) => {
    const newNickname = `${mockUser.nickname}_new`;
    await page.route(`**${ApiRoutes.CHANGE_NICKNAME}`, route =>
      route.fulfill({
        status: 200,
        json: {
          ...mockUser,
          nickname: newNickname,
        },
      }),
    );

    const generalTabButton = dialog.getByRole("tab", {
      name: "General",
      exact: true,
    });

    await generalTabButton.click();

    await expect(generalTabButton).toHaveAttribute("data-active", "");
    await expect(generalTabButton).toHaveAttribute("data-state", "active");

    const nicknameInput = dialog.locator('input[name="nickname"]');

    await expect(nicknameInput).toBeVisible();
    await expect(nicknameInput).toHaveValue(mockUser.nickname);

    await nicknameInput.clear();
    await nicknameInput.blur();

    const updateButton = dialog.getByRole("button", { name: "Update" });
    const nicknameError = dialog.locator("text=Required");

    await expect(nicknameError).toBeVisible();
    await expect(updateButton).toBeDisabled();

    await nicknameInput.fill(newNickname);
    await expect(updateButton).toBeEnabled();

    await updateButton.click();
    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
    await expect(page.locator(`text=${newNickname}`)).toBeVisible();
  });

  test("should switch tab to 'General' and properly handle a server error", async ({
    page,
  }) => {
    const newNickname = `${mockUser.nickname}_new`;
    const error = "Unexpected Error";

    await page.route(`**${ApiRoutes.CHANGE_NICKNAME}`, route =>
      route.fulfill({
        status: 500,
        json: {
          error,
        },
      }),
    );

    const generalTabButton = dialog.getByRole("tab", {
      name: "General",
      exact: true,
    });

    await generalTabButton.click();

    const nicknameInput = dialog.locator('input[name="nickname"]');
    const updateButton = dialog.getByRole("button", { name: "Update" });

    await nicknameInput.fill(newNickname);
    await expect(updateButton).toBeEnabled();

    await updateButton.click();

    await expect(dialog).toBeVisible();
    await expect(page.locator(`text=${error}`)).toBeVisible();
  });
});
