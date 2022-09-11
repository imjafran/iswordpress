import { $, $$, $Data } from "./helpers";
import axios from "axios";

class Plugin {
  slug = "";

  found = false;

  // constructor
  constructor(slug = "") {
    this.slug = slug;
  }

  get ORGUri() {
    return `https://api.wordpress.org/plugins/info/1.0/${this.slug}.json`;
  }

  // init
  async init() {
    await this.loadOrgInfo();
  }

  // get plugin info
  async loadOrgInfo() {
    await axios
      .get(this.ORGUri)
      .then((res) => {
        const data = res.data;

        if ("error" in data) {
          this.found = false;
        } else {
          this.found = true;
          this.name = data.name;
          this.slug = data.slug;
          this.version = data.version;
          this.author = data.author;
          this.author_profile = data.author_profile;
          this.last_updated = data.last_updated;
          this.homepage = data.homepage;
          this.short_description = data.short_description;
          this.description = data.description;
          this.installed = false;
          // requires
          this.requires_php = data.requires_php;
          this.requires = data.requires;
          this.tested = data.tested;
          this.added = data.added;
          this.rating = data.rating;
        }
      })
      .catch((err) => {
        this.found = false;
        let name = this.slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        this.name = name;

        this.version = "Unknown";
        this.author = "Unknown";
        this.author_profile = "Unknown";
        this.last_updated = "Unknown";
        this.homepage = "Unknown";
      });

    return;
  }

  get logo() {
    // png, gif or jpg
    return `https://ps.w.org/${this.slug}/assets/icon-128x128.png`;
  }
}

// export default
export default Plugin;
