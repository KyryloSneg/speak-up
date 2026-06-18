import { beforeMount } from "@playwright/experimental-ct-vue/hooks";
import { createPinia } from "pinia";

import "../src/main.css.ts";
import "../src/styles/style.css";

beforeMount(async ({ app }) => {
  app.use(createPinia());
});
