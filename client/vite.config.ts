import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  plugins: [
    vue(),
    tailwindcss(),
    vanillaExtractPlugin(),
    process.env.NODE_ENV !== "production" && !process.env.PLAYWRIGHT_TEST
      ? vueDevTools()
      : null,
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ["@napi-rs/canvas"],
  },
  build: {
    rollupOptions: {
      external: ["@napi-rs/canvas"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
