class App { 

  // is online
  get isOnline() {
    return navigator.onLine;
  }

  // getCurrentTab
  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  // current tab html content
  async getHtml() {
    const tab = await this.getCurrentTab();

    const html = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        return document.documentElement.innerHTML;
        },
    });

    return html[0].result; 
  }

  // get location window url from current tab 
  async getHost() {
    const tab = await this.getCurrentTab();
    return tab.url;
  }

  // is valid url
  async isValidURL() {
    const url = await this.getHost();
    return url.includes("http");
  }

  // is empty url
  async isEmptyURL() {
    const url = await this.getHost();
    return url === "";
  }

  // is internal url
  async isInternalURL() {
    const url = await this.getHost();
    return url.includes("chrome");
  }
  
}

// export
export default App;
