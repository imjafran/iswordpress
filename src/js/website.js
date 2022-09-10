import axios from "axios";

class Website { 

  host = '';

  // HTML content of the host
  HTML = "";

  // server information
  server = {};

  theme = {};

  readme = {};

  plugins = [];

  // constructor
  constructor(host = '', HTML = "") { 

    this.HTML = HTML; 
    this.host = host;
  }

  // init
  async init() { 
    await this.loadThemeInformation();
    await this.loadThemeReadme();
  }

   // is wordpress
   get isWP() {
    return this.HTML.includes("wp-content/themes");
  }


  // url
  url(link = null) {
    if (link) {
      return this.host + "/" + link;
    }
    return this.host;
  }

  // axios home
  get Rest() {
    return axios.create({
      baseURL: "https://test.jafran.me/iswp.php",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }
 
 
  get themeName() {
    if (this.isWP) {
      const theme = this.HTML.match(/wp-content\/themes\/(.*?)\//);
      if (theme && theme.length > 0) {
        return theme[1];
      }
    }
    return false;
  }

  // theme style uri
  get themeStyleURI() {
    if (this.isWP) {
      return this.url("wp-content/themes/" + this.themeName + "/style.css");
    }
    return false;
  }

  // theme screenshot uri
  get themeScreenshotURI() {
    if (this.isWP) {
      return this.url(
        "wp-content/themes/" + this.themeName + "/screenshot.png"
      );
    }
    return false;
  }

  parseThemeInformation(data) {
    const searchStrings = {
      name: "Theme Name",
      theme_uri: "Theme URI",
      description: "Description",
      author: "Author",
      author_uri: "Author URI",
      version: "Version",
      license: "License",
      license_uri: "License URI",
      tags: "Tags",
      text_domain: "Text Domain",
      domain_path: "Domain Path",
      requires_at_least: "Requires at least",
      requires_php: "Requires PHP",
      template: "Template",
    };

    const theme = {};

    for (const key in searchStrings) {
      if (searchStrings.hasOwnProperty(key)) {
        const searchString = searchStrings[key];
        // match case insensitive
        const match = data.match(new RegExp(searchString + ":\\s*(.*)", "i"));
        if (match && match.length > 0) {
          theme[key] = match[1];
        }
      }
    }

    return theme;
  }

  // loadThemeInformation
  async loadThemeInformation() {
    const response = await this.Rest.get("?host=" + this.themeStyleURI);
    const data = response.data;

    if (data && data.length > 0) {
      // this.theme = data;
      // parse theme information from data
      this.theme = this.parseThemeInformation(data);
    }
  }

  // load theme readme.txt
  async loadThemeReadme() {
    const response = await this.Rest.get(
      "?host=" + this.url("wp-content/themes/" + this.themeName + "/readme.txt")
    );
    const data = response.data;

    if (data && data.length > 0) {
      const readme = this.parseThemeInformation(data);
      // merge with theme
      this.theme = { ...this.theme, ...readme };
    }
    return false;
  }
}

// export default
export default Website;
