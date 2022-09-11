import Theme from "./theme";
import Plugin from "./plugin";
import { $, $$, $Data } from "./helpers";

class Website {
  // HTML content of the host
  HTML = "";

  // server information
  server = {};

  theme = {};

  readme = {};

  plugins = [];

  // constructor
  constructor(HTML = "") {
    this.HTML = HTML;
  }

  // is wordpress
  get isWordPress() {
    return this.HTML.includes("wp-content/themes");
  }

  get themeId() {
    const theme = this.HTML.match(/wp-content\/themes\/(.*?)\//);
    if (theme && theme.length > 0) {
      return theme[1];
    }

    return false;
  }

  // get theme
  async getTheme() {
    if (this.themeId) {
      const theme = new Theme(this.themeId);
      await theme.init();
      return theme;
    }
    return false;
  }

  // get plugin names
  getPluginNames() {
    let plugins = this.HTML.match(/wp-content\/plugins\/(.*?)\//g);
    if (plugins && plugins.length > 0) {
      plugins = plugins.map((plugin) => {
        let name = plugin.replace("wp-content/plugins/", "");
        name = name.replace("/", "");
        return name;
      });

      // unique
      plugins = [...new Set(plugins)];

      return plugins;
    }
    return [];
  } 

  // load plugins
  async getPlugins() {
    const plugins = this.getPluginNames();
    return Promise.all(
      plugins.map(async (plugin) => {
        const pluginObj = new Plugin(plugin);
        await pluginObj.init();
        return pluginObj;
      })
    );

  }

  // load server information
  async getServer() {}
}

// export default
export default Website;
