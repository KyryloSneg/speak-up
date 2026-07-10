import mockAuthUser from "@/tests/e2e/services/mockAuthUser";
import { test } from "@/tests/e2e/utils/test";
import { RoutesWithoutParams } from "@/types/routes";
import { expect } from "@playwright/test";
import { SocketResponseEvents } from "@speak-up/shared";

test.describe("CreateRoom", () => {
  test.beforeEach(async ({ page }) => await mockAuthUser(page));

  test("should render 'Join a room instead' link and properly maintain input autofocus", async ({
    page,
  }) => {
    await page.goto(RoutesWithoutParams.CREATE_ROOM);
    const goToJoinRoom = page.locator(`a[href="${RoutesWithoutParams.HOME}"]`);

    await expect(goToJoinRoom).toBeVisible();

    const maxMembersInput = page.locator('input[name="maxMembers"]');
    await expect(maxMembersInput).toBeFocused();

    await goToJoinRoom.click();
    await expect(page).toHaveURL(RoutesWithoutParams.HOME);

    const idInput = page.locator('input[name="id"]');
    await expect(idInput).toBeFocused();
  });

  test("should properly handle form validation", async ({ page }) => {
    await page.goto(RoutesWithoutParams.CREATE_ROOM);
    const submitButton = page.getByRole("button", { name: "Create" });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).not.toHaveAttribute("disabled");

    const input = page.locator('input[name="maxMembers"]');

    await expect(input).toBeVisible();
    await expect(input).toHaveValue("10");

    await input.focus(); // do not rely on autofocus here
    await input.fill("0");
    await input.blur();

    const error = page.locator("text=Too few members");

    await expect(error).toBeVisible();
    await expect(submitButton).toHaveAttribute("disabled");
  });

  test("should properly handle a server error", async ({
    page,
    mockServerIo,
  }) => {
    const serverErrorMessage = "Unexpected Error";
    mockServerIo.setResponses({
      [SocketResponseEvents.CREATE_ROOM]: { error: serverErrorMessage },
    });

    await page.goto(RoutesWithoutParams.CREATE_ROOM);
    const submitButton = page.getByRole("button", { name: "Create" });

    await submitButton.click();
    const errorMessage = page.locator(`text=${serverErrorMessage}`);

    await expect(errorMessage).toBeVisible();
    await expect(submitButton).not.toHaveAttribute("disabled");

    await expect(page).toHaveURL(RoutesWithoutParams.CREATE_ROOM);
  });

  test("should properly handle successful create", async ({ page }) => {
    await page.goto(RoutesWithoutParams.CREATE_ROOM);
    const submitButton = page.getByRole("button", { name: "Create" });

    await submitButton.click();
    await expect(page).toHaveURL(RoutesWithoutParams.ROOM);
  });
});
