import { createApp } from "vue";
import { createPinia } from "pinia";
import MainApp from "./views/Main.vue";

import "./assets/css/app.css";

import useAppStore from "./lib/app";
 
const newIcon = '/images/icon-dark.png';
chrome.runtime.sendMessage({ command: 'updateIcon', icons: { "32": newIcon, "128": newIcon } });



// // Update the extension's icons
// chrome.browserAction.setIcon({
//     path: {
//       "16": newIcon16,
//       "48": newIcon48,
//       "128": newIcon128
//     }
//   });


const isWPApp = createApp(MainApp);

const pinia = createPinia();
isWPApp.use(pinia);

const { scanWebsite } = useAppStore();
scanWebsite()

isWPApp.mount("#isWP");
