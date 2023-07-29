import axios from "axios";

export const Read = async (url ) => {
  return new Promise((resolve, reject) => {
    axios(
      {
        method: "GET",
        url: url,  
        mode: "cors", 
      }
    )
      .then((response) => { 
        resolve(response.data || null);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const constants = {
  themeKeys: {
    name: "Theme Name",
    theme_uri: "Theme URI",
    description: "Description",
    author: "Author",
    author_uri: "Author URI",
    version: "Version", 
    stable_tag: "Stable tag",
    license: "License",
    license_uri: "License URI",
    tags: "Tags",
    text_domain: "Text Domain",
    domain_path: "Domain Path",
    requires_at_least: "Requires at least",
    requires_php: "Requires PHP",
    template: "Template",
  },
  tabs: [
    {
      name: "theme",
      label: "Theme",
    },
    {
      name: "plugins",
      label: "Plugins",
    },
    // {
    //   name: "server",
    //   label: "Server",
    // },
  ],
  fetchOptions: {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  },
  excludes_shorts: [
    "wp",
    "oembed",
    "wp-site-health",
    "wp-block-editor",
    "wpcom",
    "wp.org",
    "divi",
  ],
};


export const parseData = (RAWdata) => {
  const data = {};

  for (const key in constants.themeKeys) {
    if (constants.themeKeys.hasOwnProperty(key)) {
      const searchString = constants.themeKeys[key];
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