import axios from "axios";

export const REST = (file) => {
  const base = "https://test.jafran.me/iswp.php?host=";
  return axios.get(base + file);
};

export const HOST = (param = "") => {
  return window._isWP.host + param;
};

export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);
export const $Data = (id) => $(`[data-id="${id}"]`);
export const $DataAll = (id) => $$(`[data-id="${id}"]`);

export const getContent = (url) => {
  return fetch(url, {
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
  plugin_namespaces: {
    "woocommerce": "wc",
    "advanced-custom-fields": "acf",
    "contact-form-7": "cf7",
    "adroll-for-woocommerce-stores-dev": "adroll",
    "appsero-helper": "appsero",
    "wp-mail-smtp": "wpms",
    "wp-rocket": "wpr",
    "wordpress-seo" : "yoast",
    "metorik-helper": "metorik",
    "AffiliateWP": "affwp",
    "litespeed-cache": "litespeed",

  }
}