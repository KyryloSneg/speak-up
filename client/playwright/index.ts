import { beforeMount } from "@playwright/experimental-ct-vue/hooks";
import _ from "lodash";
import { createPinia } from "pinia";

import "@/main.css.ts";
import "@/styles/style.css";

beforeMount(async ({ app, hooksConfig }) => {
  const pinia = createPinia();
  app.use(pinia);

  type HooksConfigWithInitState = { initialState?: typeof pinia.state.value };
  const typedHooksConfig = hooksConfig as HooksConfigWithInitState | unknown;

  function checkIsWithInitState(
    config: unknown,
  ): config is HooksConfigWithInitState {
    return _.isPlainObject(config);
  }

  if (
    checkIsWithInitState(typedHooksConfig) &&
    "initialState" in typedHooksConfig
  ) {
    pinia.state.value = {
      ...pinia.state.value,
      ...typedHooksConfig.initialState,
    };
  }
});
