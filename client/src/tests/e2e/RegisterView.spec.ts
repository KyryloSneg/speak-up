import { test } from "@/tests/e2e/utils/test";
import { Routes, RoutesWithoutParams } from "@/types/routes";
import { expect } from "@playwright/test";
import { ApiRoutes } from "@speak-up/shared";

test.describe("RegisterView", () => {
  test("should render 'go to /sign-in page' link and properly maintain input autofocus", async ({
    page,
  }) => {
    await page.goto(Routes.REGISTER);
    const goToSignInLink = page.locator(
      `a[href="${RoutesWithoutParams.SIGN_IN}"]`,
    );

    await expect(goToSignInLink).toBeVisible();

    const nicknameInput = page.locator('input[name="nickname"]');
    await expect(nicknameInput).toBeFocused();

    await goToSignInLink.click();
    await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);

    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toBeFocused();
  });

  test("should properly handle form validation", async ({ page }) => {
    await page.goto(Routes.REGISTER);

    const submitButton = page.getByRole("button", { name: "Register" });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).not.toHaveAttribute("disabled");

    const nicknameInput = page.locator('input[name="nickname"]');
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(nicknameInput).toBeVisible();
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await nicknameInput.fill("");
    await usernameInput.fill("u");
    await passwordInput.fill("password");

    await nicknameInput.blur();
    await usernameInput.blur();
    await passwordInput.blur();

    const nicknameError = page.locator("text=Required");
    const usernameError = page.locator("text=Username is too short");
    const passwordError = page.locator(
      "text=Must contain at least one uppercase letter",
    );

    await expect(nicknameError).toBeVisible();
    await expect(usernameError).toBeVisible();
    await expect(passwordError).toBeVisible();

    await expect(submitButton).toHaveAttribute("disabled");
  });

  test("should properly handle server error", async ({ page }) => {
    const serverErrorMessage = "Unexpected Error";
    await page.route(`**${ApiRoutes.REGISTER}`, route =>
      route.fulfill({ status: 500, json: { message: serverErrorMessage } }),
    );

    await page.goto(Routes.REGISTER);

    const submitButton = page.getByRole("button", { name: "Register" });

    const nicknameInput = page.locator('input[name="nickname"]');
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await nicknameInput.fill("nickname");
    await usernameInput.fill("username");
    await passwordInput.fill("Pas#123?");

    await nicknameInput.blur();
    await usernameInput.blur();
    await passwordInput.blur();

    await submitButton.click();

    const errorMessage = page.locator(`text=${serverErrorMessage}`);
    await expect(errorMessage).toBeVisible();
  });

  test("should properly handle successful sign in", async ({ page }) => {
    await page.route(`**${ApiRoutes.REGISTER}`, route =>
      route.fulfill({
        status: 200,
        json: {
          user: { id: "id" },
          tokens: { accessToken: "accessToken", refreshToken: "refreshToken" },
        },
      }),
    );

    await page.goto(Routes.REGISTER);

    const submitButton = page.getByRole("button", { name: "Register" });

    const nicknameInput = page.locator('input[name="nickname"]');
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await nicknameInput.fill("nickname");
    await usernameInput.fill("username");
    await passwordInput.fill("Pas#123?");

    await nicknameInput.blur();
    await usernameInput.blur();
    await passwordInput.blur();

    await submitButton.click();
    await expect(page).toHaveURL(RoutesWithoutParams.HOME);
  });
});
