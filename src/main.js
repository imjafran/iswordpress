import { createApp } from "vue";
import { createPinia } from "pinia";
import MainApp from "./views/Main.vue";

import "./assets/css/app.css";

import useAppStore from "./lib/app";

// console.log(chrome.action.setIcon);

// const newIcon = "/images/icon-32.png";

// // Update the extension's icons
// chrome.action.setIcon({ path: newIcon })


const isWPApp = createApp(MainApp);

const pinia = createPinia();
isWPApp.use(pinia);

const { scanWebsite } = useAppStore();
scanWebsite()

isWPApp.mount("#isWP");
