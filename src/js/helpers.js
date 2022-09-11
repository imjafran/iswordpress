import axios from "axios";

export const REST = file => {
  const base = "https://test.jafran.me/iswp.php?host=";
  return axios.get(base + file);
};

export const HOST = (param = '') => {
  return window._isWP.host + param;
}

export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);
export const $Data = id => $(`[data-id="${id}"]`);
export const $DataAll = id => $$(`[data-id="${id}"]`);
 