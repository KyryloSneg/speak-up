import mockAuthUser from "@/tests/e2e/services/mockAuthUser";
import setupE2EFakeBrowserMediaEngine from "@/tests/e2e/services/setupE2EFakeBrowserMediaEngine";
import { mockRoomId } from "@/tests/e2e/utils/consts";
import { test } from "@/tests/e2e/utils/test";
import { mockUser } from "@/tests/utils/consts";
import { RoutesWithoutParams } from "@/types/routes";
import { expect } from "@playwright/test";
import { APP_NAME, SocketResponseEvents } from "@speak-up/shared";

test.describe("HomeView", () => {
  test.beforeEach(async ({ page }) => await mockAuthUser(page));

  test.describe("layout", () => {
    test.describe("AppHeader", () => {
      test("should render AppHeader", async ({ page }) => {
        await page.goto(RoutesWithoutParams.HOME);
        await page.waitForLoadState("domcontentloaded");

        const header = page.locator("header").first();
        const appHeading = header.getByRole("heading", {
          level: 1,
          name: APP_NAME,
        });

        await expect(appHeading).toBeVisible();
        const toggleThemeButton = header.locator(
          'button[aria-label*="Toggle"]',
        );

        const settingsButton = header.locator(
          'button[aria-label*="Open settings"]',
        );

        await Promise.all([
          expect(toggleThemeButton).toBeVisible(),
          expect(settingsButton).toBeVisible(),
        ]);
      });
    });

    // use e2e tests instead of ct ones because i haven't figured out how to
    // disable permissions in the latter type of tests
    test.describe("UserMediaPreview", () => {
      test("should properly load both devices and show the audio meter", async ({
        page,
      }) => {
        await setupE2EFakeBrowserMediaEngine(page);
        await page.goto(RoutesWithoutParams.HOME);

        const main = page.locator("main").first();
        const userMediaPreview = main
          .locator('section[data-testid="user-media-preview"]')
          .first();

        await expect(userMediaPreview).toBeVisible();

        const nicknameLabel = userMediaPreview
          .locator("dd")
          .getByText(mockUser.nickname, { exact: true });

        const settingsButton = userMediaPreview.locator(
          'button[aria-label*="Open settings"]',
        );

        await expect(nicknameLabel).toBeVisible();
        await expect(settingsButton).toBeVisible();

        const audioMeter = userMediaPreview.locator(
          '[aria-label*="Microphone input level"]',
        );
        await expect(audioMeter).toBeVisible();

        await expect(audioMeter).toHaveAttribute("role", "meter");
        await expect(audioMeter).toHaveAttribute("aria-valuemin", "0");
        await expect(audioMeter).toHaveAttribute("aria-valuemax", "100");
      });

      test("should properly maintain microphone functionality if camera permission is denied", async ({
        page,
      }) => {
        await setupE2EFakeBrowserMediaEngine(page, { failCamera: true });
        await page.goto(RoutesWithoutParams.HOME);

        const main = page.locator("main").first();
        const userMediaPreview = main
          .locator('section[data-testid="user-media-preview"]')
          .first();

        const turnedOffCameraLabel = userMediaPreview.locator(
          "text=Camera turned off",
        );

        await expect(turnedOffCameraLabel).toBeVisible();
        const cameraSelect = userMediaPreview.locator(
          '[aria-label*="Select a camera"] [data-slot="select-value"]',
        );

        await expect(cameraSelect).toBeDisabled();
        await expect(cameraSelect).toContainText("Select");

        const audioMeter = userMediaPreview.locator(
          '[aria-label*="Microphone input level"]',
        );

        await expect(audioMeter).toBeVisible();
        const cameraButton = userMediaPreview.locator(
          'button[aria-label*="Toggle camera"]',
        );

        await expect(cameraButton).toBeDisabled();
      });

      test("should properly toggle microphone and camera 'on' and 'off' states", async ({
        page,
      }) => {
        await setupE2EFakeBrowserMediaEngine(page);
        await page.goto(RoutesWithoutParams.HOME);

        const main = page.locator("main").first();
        const userMediaPreview = main
          .locator('section[data-testid="user-media-preview"]')
          .first();

        const turnedOffCameraLabel = userMediaPreview.locator(
          "text=Camera turned off",
        );

        await expect(turnedOffCameraLabel).not.toBeVisible();
        const microphoneButton = userMediaPreview.locator(
          'button[aria-label*="Toggle microphone"]',
        );

        const cameraButton = userMediaPreview.locator(
          'button[aria-label*="Toggle camera"]',
        );

        await expect(microphoneButton).toBeVisible();
        await expect(cameraButton).toBeVisible();

        const audioMeter = userMediaPreview.locator(
          '[aria-label*="Microphone input level"]',
        );

        await expect(audioMeter).toBeVisible();

        await microphoneButton.click();
        await expect(audioMeter).not.toBeVisible();

        await cameraButton.click();
        await expect(turnedOffCameraLabel).toBeVisible();

        await microphoneButton.click();
        await expect(audioMeter).toBeVisible();

        await cameraButton.click();
        await expect(turnedOffCameraLabel).not.toBeVisible();
      });

      test("should properly show device selects", async ({ page }) => {
        await setupE2EFakeBrowserMediaEngine(page);
        await page.goto(RoutesWithoutParams.HOME);

        const main = page.locator("main").first();
        const userMediaPreview = main
          .locator('section[data-testid="user-media-preview"]')
          .first();

        const microphoneSelect = userMediaPreview.locator(
          '[aria-label*="Select a microphone"] [data-slot="select-value"]',
        );

        const cameraSelect = userMediaPreview.locator(
          '[aria-label*="Select a camera"] [data-slot="select-value"]',
        );

        await expect(microphoneSelect).toBeVisible();
        await expect(cameraSelect).toBeVisible();

        const audioMeter = userMediaPreview.locator(
          '[aria-label*="Microphone input level"]',
        );
        const turnedOffCameraLabel = userMediaPreview.locator(
          "text=Camera turned off",
        );

        await expect(audioMeter).toBeVisible();
        await expect(turnedOffCameraLabel).not.toBeVisible();
      });

      test("should lock controls and fallback to 'Select' placeholder if permissions are denied", async ({
        page,
      }) => {
        await setupE2EFakeBrowserMediaEngine(page, { denyAll: true });
        await page.goto(RoutesWithoutParams.HOME);

        const main = page.locator("main").first();
        const userMediaPreview = main
          .locator('section[data-testid="user-media-preview"]')
          .first();

        const nicknameLabel = userMediaPreview
          .locator("dd")
          .getByText(mockUser.nickname, { exact: true });

        const turnedOffCameraLabel = userMediaPreview.locator(
          "text=Camera turned off",
        );
        const audioMeter = userMediaPreview.locator(
          '[aria-label*="Microphone input level"]',
        );

        await expect(nicknameLabel).toBeVisible();
        await expect(turnedOffCameraLabel).toBeVisible();
        await expect(audioMeter).not.toBeVisible();

        const microphoneSelect = userMediaPreview.locator(
          '[aria-label*="Select a microphone"]',
        );

        const cameraSelect = userMediaPreview.locator(
          '[aria-label*="Select a camera"]',
        );

        await expect(microphoneSelect).toContainText("Select");
        await expect(cameraSelect).toContainText("Select");

        await expect(microphoneSelect).toBeDisabled();
        await expect(cameraSelect).toBeDisabled();

        const microphoneButton = userMediaPreview.locator(
          'button[aria-label*="Toggle microphone"]',
        );

        const cameraButton = userMediaPreview.locator(
          'button[aria-label*="Toggle camera"]',
        );

        await expect(microphoneButton).toBeDisabled();
        await expect(cameraButton).toBeDisabled();
      });
    });
  });

  test.describe("form", () => {
    test("should render 'Create a room instead' link and properly maintain input autofocus", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.HOME);
      const goToCreateRoom = page.locator(
        `a[href="${RoutesWithoutParams.CREATE_ROOM}"]`,
      );

      await expect(goToCreateRoom).toBeVisible();

      const idInput = page.locator('input[name="id"]');
      await expect(idInput).toBeFocused();

      await goToCreateRoom.click();
      await expect(page).toHaveURL(RoutesWithoutParams.CREATE_ROOM);

      const maxMembersInput = page.locator('input[name="maxMembers"]');
      await expect(maxMembersInput).toBeFocused();
    });

    test("should properly handle form validation", async ({ page }) => {
      await page.goto(RoutesWithoutParams.HOME);
      const submitButton = page.getByRole("button", { name: "Join" });

      await expect(submitButton).toBeVisible();
      await expect(submitButton).not.toHaveAttribute("disabled");

      const input = page.locator('input[name="id"]');
      await expect(input).toBeVisible();

      await input.focus(); // do not rely on autofocus here
      await input.blur();

      const error = page.locator("text=Required");

      await expect(error).toBeVisible();
      await expect(submitButton).toHaveAttribute("disabled");
    });

    test("should properly handle a server error", async ({
      page,
      mockServerIo,
    }) => {
      const serverErrorMessage = "Unexpected Error";
      mockServerIo.setResponses({
        [SocketResponseEvents.JOIN_ROOM]: { error: serverErrorMessage },
      });

      await page.goto(RoutesWithoutParams.HOME);

      const submitButton = page.getByRole("button", { name: "Join" });
      const input = page.locator('input[name="id"]');

      await input.fill(mockRoomId);
      await input.blur();

      await submitButton.click();
      const errorMessage = page.locator(`text=${serverErrorMessage}`);

      await expect(errorMessage).toBeVisible();
      await expect(submitButton).not.toHaveAttribute("disabled");

      await expect(page).toHaveURL(RoutesWithoutParams.HOME);
    });

    test("should properly handle successful join using room id from dynamic params", async ({
      page,
    }) => {
      await page.goto(RoutesWithoutParams.HOME + mockRoomId);

      const submitButton = page.getByRole("button", { name: "Join" });
      const input = page.locator('input[name="id"]');

      // the dynamic params should be cleared
      await expect(page).toHaveURL(RoutesWithoutParams.HOME);

      await input.blur();
      await expect(input).toHaveValue(mockRoomId);

      await submitButton.click();
      await expect(page).toHaveURL(RoutesWithoutParams.ROOM);
    });
  });
});
