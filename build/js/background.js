chrome.tabs.getSelected(null, function(tab) {
  chrome.tabs.sendRequest(tab.id, {method: "getText"}, function(response) {
      if(response.method=="getText"){
          alltext = response.data;
      }
  });
});

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
      if(request.method == "getText"){
          sendResponse({data: document.all[0].innerText, method: "getText"}); //same as innerText
      }
  }
);