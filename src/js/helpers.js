import axios from "axios";

export const REST = (file) => {
  const base = "https://test.jafran.me/iswp.php?host=";
  return axios.get(base + file);
};




export const constants = {
  themeKeys: {
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
  fetchOptions : {
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

  excludes: [
    "wp",
    "oembed",
    "wp-site-health",
    "wp-block-editor",
    "wpcom"
  ]
}




export const getContent = (url) => {
  return fetch(url, constants.fetchOptions);
};