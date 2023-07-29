import { createApp } from "vue";
import { createPinia } from "pinia";
import MainApp from "./views/Main.vue";

import "./assets/css/app.css";

const isWPApp = createApp(MainApp);

const pinia = createPinia();
isWPApp.use(pinia);
isWPApp.mount("#isWP");
