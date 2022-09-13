<template>
  <div>
    <div
      class="
        px-3
        py-1
        text-lg text-white
        flex
        items-center
        justify-between
        gap-2
      "
    >
      <h3 class="font-medium">isWP?</h3>
      <div
        class="
          opacity-40
          hover:opacity-100
          transition
          duration-75
          cursor-pointer
        "
      >
        <!-- <svg
          xmlns="http://www.w3.org/2000/svg"
          class="fill-current w-5"
          viewBox="0 0 16 16"
        >
          <path
            d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
          />
        </svg> -->
      </div>
    </div>

    <!-- header  -->
    <div class="p-3 pt-0">
      <div
        class="_header font-medium"
        :class="{
          info: state.isLoading,
          success: !state.isLoading && isWordPress,
          error: !state.isLoading && !isWordPress,
        }"
      >
        <span v-if="state.isLoading" class="_spinner icon"></span>
        {{ buttonText }}
      </div>
    </div>

    <div class="_tab-container" v-if="isWordPress">
      <!-- tab   -->

      <div class="_tabs" id="_tabs">
        <li
          v-for="tab in constants.tabs"
          :key="tab.name"
          @click="setTab(tab.name)"
          :class="{ active: state.tab === tab.name }"
        >
          {{ tab.label }}
          <span class="text-sm mt-0.5" v-show="tab.name === 'plugins'"
            >({{ totalPlugins }})</span
          >
        </li>
      </div>

      <!-- tab content -->
      <div class="tab-content" id="_contents">
        <!-- theme  -->

        <div class="tab-pane p-2" v-if="state.tab === 'theme'">
          <Theme v-if="themeId" :slug="themeId" />
          <div
            v-else
            class="text-center bg-slate-800 text-red-400 rounded-md p-3"
          >
            <div v-if="isHeadless">
              Sorry, we couldn't find any theme due to headless setup.
            </div>
            <div v-else>Theme not detected</div>
          </div>
        </div>

        <!-- plugins  -->
        <div class="tab-pane p-2" v-if="state.tab === 'plugins'">
          <div
            class="flex flex-col gap-3 w-full"
            v-if="plugins && plugins.length"
          >
            <Plugin v-for="slug in plugins" :key="slug" :slug="slug" />
          </div>
          <div
            v-else
            class="text-center bg-slate-800 text-red-400 rounded-md p-3"
          >
            <div v-if="isHeadless">
              Sorry, we couldn't find any plugins due to headless setup.
            </div>
            <div v-else>Plugins not detected</div>
          </div>
        </div>

        <!-- server  -->
        <div class="tab-pane p-2" v-if="state.tab === 'server'">
          <Server />
        </div>
      </div>
    </div>

    <div
      class="
        text-center
        py-2
        text-xs text-slate-500
        group
        hover:text-slate-200
        transition
        duration-75
      "
    >
      Developed by
      <a
        href="https://fb.com/IamJafran"
        target="_blank"
        class="text-slate-500 group-hover:text-slate-200 transition duration-75"
        >Jafran Hasan</a
      >
    </div>
  </div>
</template>

<script>
// import Theme from "./theme";
import { constants } from "./helpers";
import Sheet from "./sheet";
import Plugin from "./components/plugin.vue";
import Theme from "./components/theme.vue";
// import Server from "./components/server.vue";
import axios from "axios";

export default {
  name: "App",
  components: {
    Plugin,
    Theme,
    // Server,
  },
  data() {
    return {
      state: {
        isLoading: true,
        isWordPress: false,
        isHeadless: false,
        tab: "theme",
        themeLoaded: false,
        pluginsLoaded: false,
        serverLoaded: false,
      },
      constants: constants,
      host: "",
      html: "",
      pluginsList: [],
      RESTData: {},
      RESTPlugins: [],
      pluginShorts: [],
      proPlugins: [],
    };
  },

  // computed
  computed: {
    isOnline() {
      return navigator.onLine;
    },
    isWordPress() {
      return this.state.isWordPress;
    },
    isHeadless() {
      return this.state.isHeadless;
    },
    // is empty url
    isEmptyURL() {
      return (
        this.host === "" || this.host === "https://" || this.host === "http://"
      );
    },

    // is internal url
    isInternalURL() {
      const internalStrings =
        "file://,chrome://,moz-extension://,about:blank,brave://";
      return internalStrings.split(",").some((str) => this.host.includes(str));
    },
    // is valid url
    isValidURL() {
      return (
        this.host.startsWith("http://") || this.host.startsWith("https://")
      );
    },

    buttonText() {
      if (this.state.isLoading) return "Scanning site...";

      if (!this.isValidURL) return "It's not WordPress!";
      if (this.isInternalURL) return "It's not WordPress!";

      if (this.isWordPress) return "WordPress Inside!";

      return "It's not WordPress";
    },

    themeId() {
      const theme = this.html.match(/wp-content\/themes\/(.*?)\//);
      if (theme && theme.length > 0) {
        return theme[1];
      }

      return false;
    },

    totalPlugins() {
      return this.pluginsList.length || 0;
    },
    plugins() {
      return this.pluginsList || [];
    },
  },

  // methods
  methods: {
    // init scripts
    async init() {
      this.host = await this.getHost();

      if (!this.isValidURL) {
        this.state.isLoading = false;
        return;
      }

      this.html = await this.getHtml();

      let isWordPress =
        this.html.includes("wp-content") ||
        this.html.includes("wp-includes") ||
        this.html.includes("wp-json") ||
        this.html.includes("wp-admin/admin-ajax.php");

      const wpJson = this.host + "/wp-json";

      if (isWordPress) {
        this.state.isLoading = false;
        this.state.isWordPress = true;

        const wpJsonResponse = await fetch(wpJson, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          referrerPolicy: "no-referrer",
        });

        this.RESTData = await wpJsonResponse.json();
      } else {
        // check deep search for headless wordpress
        const wpJson = this.host + "/wp-json";

        const wpJsonResponse = await fetch(wpJson, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          referrerPolicy: "no-referrer",
        });

        this.state.isLoading = false;

        if (wpJsonResponse.status === 200) {
          this.state.isWordPress = true;
          this.state.isHeadless = true;

          this.RESTData = await wpJsonResponse.json();
        } else {
          this.state.isWordPress = false;
        }
      }

      if (this.state.isWordPress) {
        // this.loadTheme();
        this.initPlugins();
      }
    },

    setTab(tab) {
      this.state.tab = tab;
    },

    // get theme

    // get plugins

    // getCurrentTab
    async getCurrentTab() {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tabs[0];
    },

    // current tab html content
    async getHtml() {
      const tab = await this.getCurrentTab();

      const html = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return document.documentElement.innerHTML;
        },
      });

      return html[0].result;
    },

    // get location window url from current tab
    async getHost() {
      const tab = await this.getCurrentTab();
      // host name
      let host = new URL(tab.url).hostname;
      host = "https://" + host + "/";
      return host;
    },

    // load themes
    async loadTheme() {
      if (this.isWordPress && this.themeId) {
        const theme = new Theme(this.host, this.themeId);
        await theme.init();
        this.themeData = theme.getData();
        this.state.themeLoaded = true;
      } else {
        this.state.themeLoaded = true;
      }
    },

    async initPlugins() {
      let plugins = this.html.match(/wp-content\/plugins\/[0-9a-zA-Z-_]+/g);

      if (plugins && plugins.length > 0) {
        plugins = plugins.map((plugin) => {
          let name = plugin.replace("wp-content/plugins/", "");
          name = name.replace("/", "");
          return name;
        });

        // unique
        plugins = [...new Set(plugins)];

        // merge with plugins list
        this.pluginsList = plugins;
      }

      // parse more plugins from rest data
      if (this.RESTData.namespaces) {
        const routes = this.RESTData.namespaces;
        const plugins = routes
          .map((route) => {
            return route.split("/")[0];
          })
          .filter((plugin) => {
            return !constants.excludes.includes(plugin);
          });
 
        let pluginsList = [];

        this.RESTPlugins = [];

        const sheet = new Sheet();
        const pluginShorts = await sheet.getShorts();
        console.log('pluginShorts', pluginShorts);

        plugins.forEach((plugin) => {
          if (pluginShorts[plugin]) {
            pluginsList.push(pluginShorts[plugin].trim());
          } else {
            pluginsList.push(plugin);
            this.RESTPlugins.push(plugin);
          }
        });
 
        pluginsList = [...this.pluginsList, ...pluginsList];
        this.pluginsList = [...new Set(pluginsList)];

        console.log('this.pluginsList', this.pluginsList);
      }
    },
    
    // load sheet
    async loadSheet() {
      
      this.proPlugins = await sheet.getProPlugins();
    },
  },

  // created
  created() {

    // this.loadSheet();
    // init scripts
    this.init();
  },
};
</script>