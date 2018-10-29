chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ jornada: 'Ambas' }, function () {
    console.log("Padrão: 6h ou 8h ou ambos");
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.pageAction.show(tabId);
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "calcularSaida");
  });
});

chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({ url: "http://pontoeletronico.capgv.intra.bnb/pontoweb", "active": true });
});
