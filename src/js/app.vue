<template>
  <div>
    <!-- header  -->
    <div class="flex flex-col p-3 rounded-t-sm">
      <div
        class="_header font-medium"
        :class="{
          info: button.type == 'info',
          success: button.type == 'success',
          warning: button.type == 'warning',
          error: button.type == 'error',
        }"
      >
        <span v-if="state.isLoading" class="_spinner icon"></span>
        {{ button.title }}
      </div>

      <div
        class="text-center px-2 py-2 rounded-b-sm text-base bg-slate-600 tracking-wide"
        v-if="!state.isLoading && button.description" v-html="button.description"
      > 
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
          <div
            class="text-sm mt-0.5 inline-flex items-center justify-center gap-2"
            v-if="tab.name === 'plugins'"
          >
            ({{ getPlugins.length || 0 }})
            <span
              v-if="!state.pluginsLoaded"
              class="
                w-4
                h-4
                border-2 border-slate-400
                rounded-full
                border-r-transparent
                animate-spin
              "
            ></span>
          </div>
        </li>
      </div>

      <!-- tab content -->
      <div class="tab-content" id="_contents">
        <!-- theme  -->

        <div class="tab-pane p-3" v-if="state.tab === 'theme'">
          <Theme v-if="themeId" :slug="themeId" />
          <div
            v-else
            class="text-center bg-slate-800 text-red-400 rounded-md p-3"
          >
            <div v-if="isHeadlessWordPress">
              Sorry, we couldn't find any theme for {{ getHost }} due to
              headless setup.
            </div>
            <div v-else>Theme not detected</div>
          </div>
        </div>

        <!-- plugins  -->
        <div class="tab-pane p-3" v-if="state.tab === 'plugins'">
          <div
            class="flex flex-col gap-3 w-full"
            v-if="getPlugins && getPlugins.length"
          >
            <Plugin
              v-for="plugin in getPlugins"
              :key="plugin.name"
              :plugin="plugin"
            />
          </div>
          <div
            v-else
            class="text-center bg-slate-800 text-red-400 rounded-md p-3"
          >
            <div v-if="isHeadlessWordPress">
              Sorry, we couldn't find any plugins due to headless setup.
            </div>
            <div v-else>
              <span v-if="!state.pluginsLoaded">Loading plugins...</span>
              <span v-else>{{ getHost }} doesn't have any plugins</span>
            </div>
          </div>
        </div>

        <!-- server  -->
        <div class="tab-pane p-2" v-if="state.tab === 'server'">
          <Server />
        </div>
      </div>
    </div>

    <footer
      v-if="!state.isLoading"
      class="
        text-center
        py-2
        text-xs text-slate-400
        bg-slate-800
        transition
        duration-75
        px-3
      "
    >
      <em class="font-semibold">isWordPress</em> is a Free-forever and
      Open-Source Serverless Browser Extension developed by
      <a
        href="https://fb.com/IamJafran"
        target="_blank"
        class="text-sky-400 hover:text-sky-300 transition duration-75"
        >Jafran Hasan</a
      >
      to help WordPress developers and users as
      <em class="font-semibold">SADAQA</em>.
    </footer>
  </div>
</template>

<script>
// import Theme from "./theme";
import { constants, Read } from "./helpers";
import {Sheet} from "./sheet";
import Plugin from "./components/plugin.vue";
import Theme from "./components/theme.vue";
import Server from "./components/server.vue";

export default {
  name: "App",
  components: {
    Plugin,
    Theme,
    Server,
  },
  data() {
    return {
      state: {
        isLoading: true,
        isWordPress: false,
        isHeadlessWordPress: false,
        isBackendWordPress: false,
        tab: "theme",
        themeLoaded: false,
        pluginsLoaded: false,
        serverLoaded: false,
        onLine: true,
      },
      constants: constants,
      host: "",
      html: "",
      theme: {},
      plugins: [],
      RESTData: {},
      RESTPlugins: [], 
      proPlugins: [],
      pluginShorts: [],
    };
  },

  // computed
  computed: {
    isOnline() {
      return this.state.onLine;
    },
    getHost() {
      return this.host;
    },
    getSiteTitle() {
      let host = this.getHost;

      // remove www from host
      if (host.startsWith("www.")) {
        host = host.replace("www.", "");
      }

      // remove last domain tld 
      if (host.includes(".")) {
        host = host.split(".").slice(0, -1).join(".");
      }
      

      // all domain tlds
      const domains = "com co in net org info biz me co.uk org.uk net.uk ltd.uk plc.uk de fr it nl es se dk no fi eu ch at be pt nl pl ru gr jp cn hk tw au nz ca bd".split(
        " "
      );

      // remove all domain tlds
      domains.forEach((domain) => {
        if (host.includes("." + domain)) {
          host = host.replace("." + domain, "");
        }
      });
      

      // remove protocol http and https
      if (host.startsWith("http")) {
        host = host.replace("http://", "");
        host = host.replace("https://", "");
      }
  
      // let site title tag
      let title = this.html.match(/<title>(.*?)<\/title>/);

  
      if (title && title[1]) {
        title = title[1];
 

        const divisions = ["|", "-", ":"];

        for (let i = 0; i < divisions.length; i++) {
          const division = divisions[i];

          if (title.includes(division)) {
            let first = title.split(division)[0].trim();
            let second = title.split(division)[1].trim();

            // try matching with host with regex
            let regex = new RegExp(host, "i");
            if (regex.test(first) || regex.test(first.replace(' ', ''))) {
              if (first.length <= host.length + 20) return first;
            } else if (regex.test(second) || regex.test(second.replace(' ', ''))) {
              if (second.length <= host.length + 20) return second;
            }
          }
        }

        // try matching title with host
        let regex = new RegExp(host, "i");
        if (regex.test(title) || title.includes(host) || regex.test(title.replace(' ', ''))) {
          if (title.length <= host.length + 20) return title;
        }

        if (title.length <= host.length + 20) return title;
      }


      // if has dot 
      if (host.includes(".")) {
        host = host.split(".");

        let first = host[0];
        let second = host[1] || "";

        // upper first letter of first and second
        first = first.charAt(0).toUpperCase() + first.slice(1);
        second = second.charAt(0).toUpperCase() + second.slice(1);

        title = second ? `${second} ${first}` : first;

        return title;
      }
      // uppercase first letter
      host = host.charAt(0).toUpperCase() + host.slice(1);

      return host;
    },

    getUrl() {
      return "https://" + this.host + "/";
    },
    isWordPress() {
      return this.state.isWordPress;
    },
    isHeadlessWordPress() {
      return this.state.isHeadlessWordPress;
    },
    isBackendWordPress() {
      return this.state.isBackendWordPress;
    },
    // is empty url
    isEmptyURL() {
      return (
        this.getUrl === "" ||
        this.getUrl === "https://" ||
        this.getUrl === "http://"
      );
    },
    // is internal url
    isInternalURL() {
      const internalStrings =
        "file://,chrome://,moz-extension://,about:blank,brave://";
      return internalStrings
        .split(",")
        .some((str) => this.getUrl.includes(str));
    },
    // is valid url
    isValidURL() {
      return (
        this.getUrl.startsWith("http://") || this.getUrl.startsWith("https://")
      );
    },

    button() {
      // if it's loading
      if (this.state.isLoading)
        return {
          type: "info",
          title: "Scanning " + this.getSiteTitle + "...", 
        };

      // check if offline
      if (!this.isOnline)
        return {
          type: "error",
          title: "You are offline",
          description: "Please check your internet connection.",
        };

      // if it's not valid url
      if (!this.isValidURL)
        return {
          type: "error",
          title: "Invalid URL",
          description: "Invalid URL found.",
        };

      // if it's internal url
      if (this.isInternalURL)
        return {
          type: "error",
          title: "Not WordPress!",
          description: "Internal URLs are not supported.",
        };

      // if it's a valid WordPress website
      if (this.isWordPress) {
        if (this.isBackendWordPress)
          return {
            type: "success",
            title: "Backend WordPress!",
            description: `<strong>${this.getSiteTitle}</strong> is using WordPress as a Backend.`,
          };

        if (this.isHeadlessWordPress)
          return {
            type: "success",
            title: "Headless WordPress!",
            description:
              `<strong>${this.getSiteTitle}</strong> is using WordPress as a headless CMS. WordPress is installed at <a class="text-sky-400" href="${this.RESTData.url}">${this.RESTData.url}</a>`,
          };

        return {
          type: "success",
          title: "WordPress Inside!",
          description: `<strong>${this.getSiteTitle}</strong> is using WordPress CMS.`,
        };
      }

      // if it's not a WordPress website
      return {
        type: "error",
        title: "It's not WordPress!",
        description: `<strong>${this.getSiteTitle}</strong> is not using WordPress.`,
      };
    },

    themeId() {
      if (!this.html) return;

      const theme = this.html.match(/wp-content\/themes\/(.*?)\//);
      if (theme && theme.length > 0) {
        return theme[1];
      }

      return;
    },

    getPlugins() {
      let plugins = this.plugins;

      // get unique list by slug
      plugins = plugins.filter(
        (plugin, index, self) =>
          index === self.findIndex((t) => t.slug === plugin.slug)
      );

      // sort by slug
      plugins = plugins.sort((a, b) => {
        if (a.slug < b.slug) {
          return -1;
        }
        if (a.slug > b.slug) {
          return 1;
        }
        return 0;
      });

      return plugins;
    },
  },

  // methods
  methods: {

    setTab(tab) {
      this.state.tab = tab;
    }, // getCurrentTab
    
    async getCurrentTab() {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tabs[0];
    },


    // get location window url from current tab
    async initHost() {
      const tab = await this.getCurrentTab();
      // host name
      let host = new URL(tab.url).hostname;
      this.host = host;
      return host;
    },


    // current tab html content
    async initHTML() {
      const tab = await this.getCurrentTab();

      const html = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return document.documentElement.innerHTML;
        },
      });

      this.html = html[0].result;

      return this.html;
    },


    // init scripts
    async init() { 

      // check if it's wordpress
      const isWordPress = await this.checkIfWordPress();

      // if it's wordpress, then collect plugin data
      if (isWordPress) { 

        await this.loadSheet();

        await this.initPlugins();
      }
    },

    async checkIfWordPress() {
      if (!this.isValidURL) {
        this.state.isLoading = false;
        return;
      }

      const html = this.html
      // matches and searches
      let isWordPress = false;
      let isBackendWordPress = false;
      let isHeadlessWordPress = false;
 

      // try matching plugins from html data
      const frontendKeywords = [
        this.getUrl + "wp-content/",
        this.getUrl + "wp-includes/",
        this.getUrl + "wp-admin/",
        this.getUrl + "wp-json/",
        this.getUrl + "wp-admin/",
      ];

      const headlessKeywords = [
        "wp-content/",
        "wp-includes/",
        "wp-json/",
        "wp-admin/",
      ];

      // try matching frontendKeywords from html text
      frontendKeywords.forEach((match) => {
        if (html.includes(match)) {
          isWordPress = true;
        }
      });

      // try matching headlessKeywords from html text
      if (!isWordPress) {
        headlessKeywords.forEach((match) => {
          if (html.includes(match)) {
            isHeadlessWordPress = !isWordPress;
            isWordPress = true;
          }
        });
      }

      // if it\'s found WordPress in basic keywords
      if (isWordPress) {
        this.state.isLoading = false;
        this.state.isWordPress = isWordPress;
      }

      // try collecting plugin data from wp-json
      const wpJson = this.getUrl + "wp-json";

      const wpJsonResponse = await Read(wpJson);
 

      if (wpJsonResponse) {
        const isValidData = wpJsonResponse && typeof (wpJsonResponse) === "object" && wpJsonResponse.namespaces && wpJsonResponse.namespaces.length > 0; 

        isBackendWordPress = isValidData ? !isWordPress : false;
        isWordPress = isValidData ? true : isWordPress;
        this.RESTData = isValidData ? wpJsonResponse : {};
      }

      this.state.isLoading = false;
      this.state.isWordPress = isWordPress;
      this.state.isHeadlessWordPress = isHeadlessWordPress;
      this.state.isBackendWordPress = isBackendWordPress;

      this.state.isLoading = false;
      return isWordPress;
    },

    
    // loadSheet
    async loadSheet(){
      const data = await Sheet.getShorts();

      this.pluginShorts = data;
    },

    
    // load themes
    async loadTheme() {
      if (this.isWordPress && this.themeId) {
        const theme = new Theme(this.getUrl, this.themeId);
        await theme.init();
        this.themeData = theme.getData();
        this.state.themeLoaded = true;
      } else {
        this.state.themeLoaded = true;
      }
    },

    async initPlugins() {
      let plugins = [];

      // match from html

      let matchedPlugins = this.html.match(
        /wp-content\/plugins\/[0-9a-zA-Z-_]+/g
      );

      if (matchedPlugins && matchedPlugins.length > 0) {
        matchedPlugins = matchedPlugins
          .map((pluginUrl) => {
            let slug = pluginUrl.replace("wp-content/plugins/", "");
            return slug.replace("/", "");
          })
          .filter((slug) => {
            return slug;
          })
          .map((slug) => {
            return {
              slug: slug,
              source: "html",
            };
          });

        plugins = matchedPlugins;
 
      } 

      // parse more plugins from rest data
      if (this.RESTData && this.RESTData.namespaces) {
        const namespaces = this.RESTData.namespaces;

        const foundPlugins = namespaces
          .map((namespace) => {
            return namespace.split("/")[0] || false;
          })
          .filter((slug) => {
            // filter from excludes_shorts
            return !constants.excludes_shorts.includes(slug);
          })
          .map((slug) => {
            // if found in pluginShorts's key, set value as slug 
            if (slug in this.pluginShorts) {
              slug = this.pluginShorts[slug];
            } 
 
            return slug;
            
          })
          // .filter((slug) => {
          //   // filter from plugins
          //   return !plugins.find((plugin) => {
          //     return plugin.slug === slug;
          //   });
          // })
          .map((slug) => {
            return {
              slug: slug,
              source: "api",
            };
          });
 
          
        plugins = [...plugins, ...foundPlugins];

        // make sure slug is unique

        plugins = plugins.filter((plugin, index, self) => {
          return (
            index ===
            self.findIndex((t) => {
              return t.slug === plugin.slug;
            })
          );
        });



      }

      this.state.pluginsLoaded = true;

      this.plugins = plugins;

      console.log("plugins", plugins);
      return plugins
 
    },
 
  },

  // created
  async created() {
    await this.initHost();
    await this.initHTML();

    this.state.onLine = navigator.onLine;

    // check if offline
    if (this.isOnline) {
      this.init();
    }
  },
};
</script>