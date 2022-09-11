import { REST, HOST, $, $$, $Data} from "./helpers";

class Theme {
  // HTML content of the host
  themeId = "";

  data = {};

  // constructor
  constructor(themeId = "") {
    this.themeId = themeId;
  }

  // init
  async init() {
    await this.loadTheme();
    await this.loadReadme();
  }

  // theme style uri
  get styleSheet() {
    return HOST("wp-content/themes/" + this.themeId + "/style.css");
  }

  // theme screenshot uri
  get screenshot() {
    return HOST("wp-content/themes/" + this.themeId + "/screenshot.png");
  }

  // readme.txt
  get readme() {
    return HOST("wp-content/themes/" + this.themeId + "/readme.txt");
  }

  Keys = {
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

  parseInformation(RAWdata) {
    const data = {};

    for (const key in this.Keys) {
      if (this.Keys.hasOwnProperty(key)) {
        const searchString = this.Keys[key];
        // match case insensitive
        const match = RAWdata.match(
          new RegExp(searchString + ":\\s*(.*)", "i")
        );
        if (match && match.length > 0) {
          data[key] = match[1];
        }
      }
    }

    return data;
  }

  // loadThemeInformation
  async loadTheme() {
    try {
      const response = await REST(this.styleSheet);
      const data = response.data;

      if (data && data.length > 0) {
        this.data = this.parseInformation(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // load theme readme.txt
  async loadReadme() {
    try {
      REST(this.readme).then((response) => { 
        const data = response.data;

        if (data && data.length > 0) {
          const readme = this.parseInformation(data);
          // merge with theme
          this.data = { ...this.data, ...readme };
        }
        return false;
      });
    } catch (error) {
      return false;
    }
  }

  getData() {
    const reversedKeys = Object.keys(this.Keys).reverse();

    const data = {};

    for (const key of reversedKeys) {
      if (this.data.hasOwnProperty(key)) {
        data[this.Keys[key]] = this.data[key];
      }
    }

    return data;
  }
}

// export default
export default Theme;
