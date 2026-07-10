import SettingsModal from "@/components/global/settings/modal/SettingsModal.vue";
import { expect, test } from "@playwright/experimental-ct-vue";

test.describe("SettingsModal", () => {
  test("should default to 'Audio' tab and display audio meter", async ({
    page,
    mount,
  }) => {
    await mount(SettingsModal);
    const settingsButton = page.locator('button[aria-label*="Open settings"]');

    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const audioTabButton = dialog.getByRole("tab", {
      name: "Audio",
      exact: true,
    });

    await expect(audioTabButton).toHaveAttribute("data-active", "");
    await expect(audioTabButton).toHaveAttribute("data-state", "active");

    const microphoneSelect = dialog.locator(
      '[aria-label*="Select a microphone"]',
    );

    await expect(microphoneSelect).toBeVisible();
    const audioMeter = dialog.locator('[aria-label*="Microphone input level"]');

    await expect(audioMeter).toBeVisible();
    await expect(audioMeter).toBeEnabled();
  });

  test("should switch tab to 'Video' and display camera preview (mobile)", async ({
    page,
    mount,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await mount(SettingsModal);
    const settingsButton = page.locator('button[aria-label*="Open settings"]');

    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const videoTabButton = dialog.getByRole("tab", {
      name: "Video",
      exact: true,
    });

    await videoTabButton.click();

    await expect(videoTabButton).toHaveAttribute("data-active", "");
    await expect(videoTabButton).toHaveAttribute("data-state", "active");

    const cameraSelect = dialog.locator('[aria-label*="Select a camera"]');
    await expect(cameraSelect).toBeVisible();

    const videoPreview = dialog.locator('video[aria-label*="Camera preview"]');
    await expect(videoPreview).toBeVisible();
  });
});
