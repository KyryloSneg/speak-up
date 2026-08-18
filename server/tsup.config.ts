import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  clean: true,
  noExternal: ["@speak-up/shared"],
  external: ["@napi-rs/canvas"],
});
