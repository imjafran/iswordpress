import axios from "axios";

class Sheet {
  sheet_url =
  "https://docs.google.com/spreadsheets/export?format=csv&id=1jbMcWsFK3ymaUJnD3WpbZAQQhrUgR1pSLE17mkO_nqg&gid=";

  shortsTabId = 0;

  proTabId = 1290219858;

  // get shorts
  async getShorts() {
    const response = await axios.get(this.sheet_url + this.shortsTabId);
    const data = response.data;

    const lines = data.split("\n").slice(1);
    
    // key value pair 
    const shorts = {};
    lines.forEach((line) => {
      const [key, value] = line.split(",");
      shorts[key] = value.replace(/"/g, "");
    });

    return shorts;
  }

  // get pro
  async getProPlugins() {
    const response = await axios.get(this.sheet_url + this.proTabId);
    const data = response.data;

    const lines = data.split("\n").slice(1);

    return lines;
  }
}

export default Sheet;