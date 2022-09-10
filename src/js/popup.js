// // Initialize butotn with users's prefered color
// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// // When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener("click", async () => {
//   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: setPageBackgroundColor,
//   });
// });

// // The body of this function will be execuetd as a content script inside the
// // current page
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
//   });
// }

import App from "./app";
import Website from "./website";

(function () {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);

  const isWP = {
    state: {
      isWP: true,
      tab: "theme",
    },

    app: null,

    // init
    init() {
      this.bindEvents();
      this.initApp();
    },

    // bindEvents
    bindEvents() {
      $$("#_tabs > [data-tab]").forEach((tab) => {
        tab.addEventListener("click", this.handleTabClick);
      });
    },

    // handleTabClick
    handleTabClick(e) {
      // index of tabs
      const tabId = e.target.getAttribute("data-tab") || "theme";

      const tab = $(`#_tabs > [data-tab="${tabId}"]`);
      const content = $(`#_contents > [data-tab="${tabId}"]`);

      // remove active class
      $$("#_tabs > [data-tab]").forEach((tab) => {
        tab.classList.remove("active");
      });

      $$("#_contents > [data-tab]").forEach((content) => {
        content.style.display = "none";
      });

      // add active class
      tab.classList.add("active");
      content.style.display = "block";
    },

    // initApp
    async initApp() {
      const app = new App();

      const html = await app.getHTML();

      if (!app.isOnline) {
        alert(
          "Sorry pal! you are offline. Please check your internet connection."
        );
        return;
      } 
 
      const host = await app.getLocation();
      const website = new Website(host, html); 

      const header = $("._header");
      header.classList.remove("info");

      if (website.isWP) {
        header.innerHTML = "Yes! WordPress!";
        header.classList.remove("info");
        header.classList.add("success");

        await website.init();
      } else {
        header.innerHTML = "Nope, It's not WordPress";
        header.classList.add("error");
      }

      this.formatTheme(website);
    },

    // formatTheme
    formatTheme(w) {
      console.log(w.theme);
    },
  };

  // init
  document.addEventListener("DOMContentLoaded", function () {
    isWP.init();
  });
})();
