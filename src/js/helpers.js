import axios from "axios";

export const REST = file => {
  const base = "https://test.jafran.me/iswp.php?host=";
  return axios.get(base + file);
};

export const HOST = (param = '') => {
  return window.HOST + param;
}

export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);
export const $Data = id => document.querySelector.bind("[data-id='" + id + "']");
export const $DataAll = id => document.querySelectorAll.bind("[data-id='" + id + "']");