import { Read } from "./helpers.js";

const sheet_url =
  "https://docs.google.com/spreadsheets/export?format=csv&id=1jbMcWsFK3ymaUJnD3WpbZAQQhrUgR1pSLE17mkO_nqg&gid=";
const shortsTabId = 0;
const proTabId = 1290219858;

export const Sheet = {
   
  // get shorts
  async getShorts() {
    const data = await Read(sheet_url + shortsTabId); 

    const lines = data.split("\n").slice(1);
    
    // key value pair 
    const shorts = {};
    lines.forEach((line) => {
      const [key, value] = line.split(",")
      shorts[key] = value.replace(/"/g, "").trim();
    });

    return shorts;
  },

  // get pro
  async getProPlugins() {
    const response = await axios.get(sheet_url + proTabId);
    const data = response.data;

    const lines = data.split("\n").slice(1);

    return lines;
  }
}
