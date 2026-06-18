import { defineConfig, devices } from "@playwright/experimental-ct-vue";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  testDir: "./src/tests/ct",

  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    actionTimeout: 0,
    trace: "on-first-retry",
    headless: !!process.env.CI,
    ctPort: 3100,
    ctViteConfig: {
      plugins: [vue(), tailwindcss(), vanillaExtractPlugin() as any],
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
      },
    },
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
});
