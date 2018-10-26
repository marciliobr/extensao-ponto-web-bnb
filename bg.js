chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({jornada: 'Ambas'}, function() {
    console.log("Padrão: 6h ou 8h ou ambos");
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (~tab.url.indexOf('pontoweb')) {
    chrome.pageAction.show(tabId);
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, "calcularSaida");
    });
  }
});


