chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (~tab.url.indexOf('http://pontoeletronico.capgv.intra.bnb/')) {
    chrome.pageAction.show(tabId);
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "calcularSaida");
    });
  }
});
