class App { 

  HTML = "";

  // constructor
  constructor(HTML) {
    this.HTML = HTML;
  }

  // methods

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
  async getHTML() {
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
  async getLocation() {
    const tab = await this.getCurrentTab();
    return tab.url;
  }


}

// export
export default App;
