chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.pageAction.show(tabId);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "");
  });
});

chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({ url: "http://pontoeletronico.capgv.intra.bnb/pontoweb", "active": true });
});