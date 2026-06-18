import ThemeToggle from "@/components/themeToggle/ThemeToggle.vue";
import { expect, test } from "@playwright/experimental-ct-vue";

test.describe("ThemeToggle", () => {
  test("should properly toggle global theme back and forward", async ({
    mount,
    page,
  }) => {
    await mount(ThemeToggle);

    const htmlElement = page.locator("html");
    const themeToggle = page.getByRole("button");

    await expect(themeToggle).toHaveAttribute(
      "aria-label",
      "Toggle dark theme",
    );

    await expect(htmlElement).toHaveAttribute("data-theme", "light");

    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute(
      "aria-label",
      "Toggle light theme",
    );

    await expect(htmlElement).toHaveAttribute("data-theme", "dark");
    await themeToggle.click();

    await expect(themeToggle).toHaveAttribute(
      "aria-label",
      "Toggle dark theme",
    );

    await expect(htmlElement).toHaveAttribute("data-theme", "light");
  });
});
