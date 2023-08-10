// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'updateIcon') {
      const { icons } = message;
      console.log("icons", icons);
      chrome.action.setIcon({ path: icons });
    }
  });
  