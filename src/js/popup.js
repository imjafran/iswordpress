import App from "./app";
import Website from "./website";
import { $, $$, $Data } from "./helpers";

(function () {
  const isWordPress = {
    // init
    async init() {
      this.bindEvents();
      await this.initApp();
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

      const host = await app.getHost();
      window.HOST = host;

      const header = $("._header");
      header.classList.remove("info");

      if (!(await app.isValidURL())) {
        header.classList.add("error");
        header.innerHTML = "Invalid Tab!";
        return;
      }

      const html = await app.getHtml();

      const website = new Website(html);

      if (website.isWordPress) {
        header.innerHTML = "WordPress found!";
        header.classList.remove("info");
        header.classList.add("success");

        $("._tab-container").style.display = "block";

        await this.initTheme(website);
      } else {
        header.innerHTML = "WordPress not found!";
        header.classList.add("error");
      }
    },

    // initTheme
    async initTheme(website) {
      const theme = await website.getTheme();

      // console.log(theme);

      // return;

      // alert(w.themeScreenshotURI);
      $Data("screenshot").src = theme.screenshot;

      const format = (name, value) => `<div class="_tr">
      <label>${name}:</label>
      <div>${value}</div>
    </div>`;

      let themeData = theme.getData();

      let themeHTML = "";

      for (const [key, value] of Object.entries(themeData).reverse()) {
        themeHTML += format(key, value);
      }
 
      console.log($Data("theme_data"));
      $Data("theme_data").innerHTML = themeHTML;

      $("#_contents").style.display = "block";
      $("#_content_loader").style.display = "none";
    },
  };

  // init
  document.addEventListener("DOMContentLoaded", function () {
    isWordPress.init();
  });
})();
