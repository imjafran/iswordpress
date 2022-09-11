import App from "./app";
import Website from "./website";
import { $, $$, $Data } from "./helpers";

(function () {
  window._isWP = {};

  class isWP {
    state = {
      themeLoaded: false,
      pluginsLoaded: false,
      serverLoaded: false,
    };

    // init
    async init() {
      this.bindEvents();
      await this.initApp();
    }

    // bindEvents
    bindEvents() {
      $$("#_tabs > [data-tab]").forEach((tab) => {
        tab.addEventListener("click", this.handleTabClick.bind(this));
      });
    }

    // handleTabClick
    handleTabClick = async (e) => {
      const tabId = e.target.getAttribute("data-tab") || "theme";

      $$("#_tabs > [data-tab]").forEach((tab) => {
        tab.classList.remove("active");
      });

      e.target.classList.add("active");

      $$("#_contents > [data-content]").forEach((content) => {
        content.style.display = "none";
      });

      $(`#_contents > [data-content="${tabId}"]`).style.display = "block";

      if (tabId === "plugins" && !this.state.pluginsLoaded) {
        await this.loadPlugins();
      }

      if (tabId === "server" && !this.state.serverLoaded) {
        await this.loadServer();
      }
    };

    // initApp
    async initApp() {
      const app = new App();

      const host = await app.getHost();
      window._isWP.host = host;

      const header = $("._header");
      header.classList.remove("info");

      if (!(await app.isValidURL())) {
        header.classList.add("error");
        header.innerHTML = "Invalid Tab!";
        return;
      }

      const html = await app.getHtml();
      window._isWP.html = html;

      const website = new Website(html);

      window._isWP.website = website;

      if (website.isWordPress) {
        header.innerHTML = "WordPress found!";
        header.classList.remove("info");
        header.classList.add("success");

        $("._tab-container").style.display = "block";

        // init plugin count

        const plugin_count = website.getPluginNames().length;
        const span = document.createElement("span");
        span.innerHTML = "(" + plugin_count + ")";

        $("#_tabs [data-tab='plugins']").appendChild(span);

        await this.initTheme(website);
      } else {
        header.innerHTML = "WordPress not found!";
        header.classList.add("error");
      }
    }

    // initTheme
    async initTheme(website) {
      $("#_contents").style.display = "block";

      const theme = await website.getTheme();

      this.state.themeLoaded = true;

      $Data("screenshot").src = theme.screenshot;

      const format = (name, value) => `<div class="_tr">
      <label>${name}:</label>
      <div>${value}</div>
    </div>
    `;

      let themeData = theme.getData();

      let themeHTML = "";

      for (const [key, value] of Object.entries(themeData).reverse()) {
        themeHTML += format(key, value);
      }

      $Data("theme_data").innerHTML = themeHTML;

      $Data("theme_loader").style.display = "none";
    }

    // loadPlugins
    async loadPlugins() {
      const website = window._isWP.website;

      const plugins = await website.getPlugins();

      plugins.forEach((plugin) => {
        console.log(plugin.name);
      });

      this.state.pluginsLoaded = true;
    }

    // loadServer
    async loadServer() {
      this.state.serverLoaded = true;
    }
  }

  // init
  document.addEventListener("DOMContentLoaded", async () => {
    const app = new isWP();
    await app.init();
  });
})();
