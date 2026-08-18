import { test } from "@/tests/e2e/utils/test";
import { RoutesWithoutParams } from "@/types/routes";
import { expect } from "@playwright/test";
import { ApiRoutes, APP_NAME } from "@speak-up/shared";

test.describe("SignInView", () => {
  test("should render AppHeader", async ({ page }) => {
    await page.goto(RoutesWithoutParams.SIGN_IN);
    await page.waitForLoadState("domcontentloaded");

    const appHeading = page.getByRole("heading", { level: 1, name: APP_NAME });
    await expect(appHeading).toBeVisible();

    const toggleThemeButton = page.locator('button[aria-label*="Toggle"]');
    await expect(toggleThemeButton).toBeVisible();
  });

  test("should render 'go to /register page' link and properly maintain input autofocus", async ({
    page,
  }) => {
    await page.goto(RoutesWithoutParams.SIGN_IN);
    const goToSignUpLink = page.locator(
      `a[href="${RoutesWithoutParams.REGISTER}"]`,
    );

    await expect(goToSignUpLink).toBeVisible();

    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toBeFocused();

    await goToSignUpLink.click();
    await expect(page).toHaveURL(RoutesWithoutParams.REGISTER);

    const nicknameInput = page.locator('input[name="nickname"]');
    await expect(nicknameInput).toBeFocused();
  });

  test("should properly handle form validation", async ({ page }) => {
    await page.goto(RoutesWithoutParams.SIGN_IN);

    const submitButton = page.getByRole("button", { name: "Log In" });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).not.toHaveAttribute("disabled");

    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await usernameInput.fill("u");
    await passwordInput.fill("password");

    await usernameInput.blur();
    await passwordInput.blur();

    const usernameError = page.locator("text=Username is too short");
    const passwordError = page.locator(
      "text=Must contain at least one uppercase letter",
    );

    await expect(usernameError).toBeVisible();
    await expect(passwordError).toBeVisible();

    await expect(submitButton).toHaveAttribute("disabled");
  });

  test("should properly handle server error", async ({ page }) => {
    const serverErrorMessage = "Unexpected Error";
    await page.route(`**${ApiRoutes.SIGN_IN}`, route =>
      route.fulfill({ status: 500, json: { message: serverErrorMessage } }),
    );

    await page.goto(RoutesWithoutParams.SIGN_IN);

    const submitButton = page.getByRole("button", { name: "Log In" });

    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await usernameInput.fill("username");
    await passwordInput.fill("Pas#123?");

    await usernameInput.blur();
    await passwordInput.blur();

    await submitButton.click();
    const errorMessage = page.locator(`text=${serverErrorMessage}`);

    await expect(errorMessage).toBeVisible();
    await expect(page).toHaveURL(RoutesWithoutParams.SIGN_IN);
  });

  test("should properly handle successful sign in", async ({ page }) => {
    await page.route(`**${ApiRoutes.SIGN_IN}`, route =>
      route.fulfill({
        status: 200,
        json: {
          user: { id: "id" },
          tokens: { accessToken: "accessToken", refreshToken: "refreshToken" },
        },
      }),
    );

    await page.goto(RoutesWithoutParams.SIGN_IN);

    const submitButton = page.getByRole("button", { name: "Log In" });

    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await usernameInput.fill("username");
    await passwordInput.fill("Pas#123?");

    await usernameInput.blur();
    await passwordInput.blur();

    await submitButton.click();
    await expect(page).toHaveURL(RoutesWithoutParams.HOME);
  });

  test("should properly handle invisible focus buttons", async ({ page }) => {
    await page.goto(RoutesWithoutParams.SIGN_IN);

    const header = page.getByRole("banner").first();
    const firstHeaderButton = header.getByRole("button").nth(1);

    const cardFocusButton = page.getByRole("button", {
      name: "Go back to the header",
    });

    const headerFocusButton = page.getByRole("button", {
      name: "Skip to the main content",
    });

    const usernameInput = page.locator('input[name="username"]');

    await cardFocusButton.focus();
    await cardFocusButton.click();

    await expect(firstHeaderButton).toBeFocused();

    await headerFocusButton.focus();
    await headerFocusButton.click();

    await expect(usernameInput).toBeFocused();
  });
});
