import "@/main.css.ts";
import "@/styles/style.css";

import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "@/App.vue";
import router from "@/router/index";
import initGlobalPlaywrightStores from "@/utils/initGlobalPlaywrightStores";
import { APP_NAME } from "@speak-up/shared";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
document.title = APP_NAME;

initGlobalPlaywrightStores();
