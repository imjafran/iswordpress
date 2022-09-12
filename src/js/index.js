// import App from "./app";
// import Website from "./website";
// import { $, $$, $Data } from "./helpers";

import * as Vue from "vue";
import App from "./app.vue";

const isWPApp = Vue.createApp(App);
isWPApp.mount("#isWP");

// (function () {
//   window._isWP = {};

//   class isWP {
//     state = {
//       themeLoaded: false,
//       pluginsLoaded: false,
//       serverLoaded: false,
//     };

//     // init
//     async init() {
//       this.bindEvents();
//       await this.initApp();
//     }

//     // bindEvents
//     bindEvents() {
//       $$("#_tabs > [data-tab]").forEach((tab) => {
//         tab.addEventListener("click", this.handleTabClick.bind(this));
//       });
//     }

//     // handleTabClick
//     handleTabClick = async (e) => {
//       const tabId = e.target.getAttribute("data-tab") || "theme";

//       $$("#_tabs > [data-tab]").forEach((tab) => {
//         tab.classList.remove("active");
//       });

//       e.target.classList.add("active");

//       $$("#_contents > [data-content]").forEach((content) => {
//         content.style.display = "none";
//       });

//       $(`#_contents > [data-content="${tabId}"]`).style.display = "block";

//       if (tabId === "plugins" && !this.state.pluginsLoaded) {
//         await this.loadPlugins();
//       }

//       if (tabId === "server" && !this.state.serverLoaded) {
//         await this.loadServer();
//       }
//     };

//     handlePluginClick = async (e) => {
//       const plugin = e.target.closest("._plugin");
//       const plugin_details = plugin.querySelector("._plugin-details");

//       console.log(plugin_details);

//       if (plugin_details.style.display === "block") {
//         plugin_details.style.display = "none";
//       } else {
//         plugin_details.style.display = "block";
//       }
//     };

//     // initApp
//     async initApp() {
//       const app = new App();

//       const host = await app.getHost();
//       window._isWP.host = host;

//       const header = $("._header");
//       header.classList.remove("info");

//       if (!(await app.isValidURL())) {
//         header.classList.add("error");
//         header.innerHTML = "Invalid Tab!";
//         return;
//       }

//       const html = await app.getHtml();
//       window._isWP.html = html;

//       const website = new Website(html);

//       window._isWP.website = website;

//       if (website.isWordPress) {
//         header.innerHTML = "WordPress found!";
//         header.classList.remove("info");
//         header.classList.add("success");

//         $("._tab-container").style.display = "block";

//         // init plugin count

//         const plugin_count = website.getPluginNames().length;
//         const span = document.createElement("span");
//         span.innerHTML = "(" + plugin_count + ")";

//         $("#_tabs [data-tab='plugins']").appendChild(span);

//         await this.initTheme(website);
//       } else {
//         header.innerHTML = "WordPress not found!";
//         header.classList.add("error");
//       }
//     }

//     // initTheme
//     async initTheme(website) {
//       $("#_contents").style.display = "block";

//       const theme = await website.getTheme();

//       this.state.themeLoaded = true;

//       // check if theme.screenshot exists online
//       const isScreenshot = await theme.checkScreenshot();

//       if (isScreenshot) {
//         $Data("screenshot").src = theme.screenshot;
//       } else {
//         $Data("screenshot").src = "https://via.placeholder.com/300x200";
//       }

//       const format = (name, value) => `<div class="_tr">
//       <label>${name}:</label>
//       <div>${value}</div>
//     </div>
//     `;

//       let themeData = theme.getData();

//       let themeHTML = "";

//       for (const [key, value] of Object.entries(themeData).reverse()) {
//         themeHTML += format(key, value);
//       }

//       $Data("theme_data").innerHTML = themeHTML;

//       $Data("theme_loader").style.display = "none";
//     }

//     // loadPlugins
//     async loadPlugins() {
//       const website = window._isWP.website;

//       const plugins = await website.getPlugins();

//       const formatPlugin = (
//         plugin
//       ) => `<li class="w-full relative bg-slate-800 rounded-md _plugin">

//       <label
//         class="px-3 text-base w-full cursor-pointer transition duration-75 py-2 flex items-center justify-between">
//         <span class="font-medium tracking-wide">${
//           plugin.name.slice(0, 20) + (plugin.name.length > 20 ? "..." : "")
//         }</span>
//         <svg xmlns="http://www.w3.org/2000/svg" class="fill-current w-4" viewBox="0 0 16 16">
//           <path fill-rule="evenodd"
//             d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
//         </svg>
//       </label>

//       <div class="px-3 py-1 _plugin-details" style="display: none">
//         <div class="my-2">${plugin.name}</div>
//         <div class="mt-2 flex items-center gap-1 text-slate-400">
//           by
//           <a target="_blank" href="${plugin.author_profile}">${plugin.author}</a>
//           |
//           version
//           <span>${plugin.version}</span>
//         </div>

// ${
//   plugin.homepage && plugin.homepage.length
//     ? `<div class="my-3 flex items-center justify-center">
// <a target="_blank" href="${plugin.homepage}"
//   class="hover:no-underline bg-slate-600 text-white px-3 py-1.5 text-sm rounded-md flex items-center justify-center hover:bg-blue-500 pb-1">On WordPress.Org</a>
// </div>`
//     : `<div class="my-3 text-red-500 flex items-center justify-center"> Not available on WordPress.org </div>`
// }

//       </div>
//     </li>`;

//       let pluginHTML = "";
//       plugins.forEach((plugin) => {
//         pluginHTML += formatPlugin(plugin);
//       });

//       $("#_plugins").innerHTML = pluginHTML;

//       $Data("plugin_loader").style.display = "none";

//       this.state.pluginsLoaded = true;

//       $$("#_plugins > ._plugin").forEach((plugin) => {
//         console.log(plugin);
//         plugin.addEventListener("click", this.handlePluginClick.bind(this));
//       });
//     }

//     // loadServer
//     async loadServer() {
//       this.state.serverLoaded = true;
//     }
//   }

//   // init
//   document.addEventListener("DOMContentLoaded", async () => {
//     const app = new isWP();
//     await app.init();
//   });
// })();
