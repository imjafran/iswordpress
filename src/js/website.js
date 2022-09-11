
import Theme from "./theme"; 
import {$, $$, $Data} from "./helpers";

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


  // load plugins
  async getPlugins() {
   return [];
  }

  // load server
  async getServer() {
    return {};
  }

}

// export default
export default Website;
