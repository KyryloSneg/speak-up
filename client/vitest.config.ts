import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [vanillaExtractPlugin()],
    test: {
      environment: "jsdom",
      include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
      exclude: [
        ...configDefaults.exclude,
        "src/tests/e2e/**",
        "src/tests/ct/**",
      ],
      root: fileURLToPath(new URL("./", import.meta.url)),
    },
  }),
);
