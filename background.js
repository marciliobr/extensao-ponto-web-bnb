//URL da página do ponto eletrônico, o primeiro elemento será o chamado para criar nova aba.
const PONTO_WEB_URLS = [
  "http://pontoeletronico.capgv.intra.bnb/pontoweb",
  "https://pontoeletronico.capgv.intra.bnb/pontoweb"
  // Adicione outras URLs do ponto aqui
];

// Função para verificar se a URL está na lista de URLs permitidas
function verificaUrlPermitida(url) {
  return PONTO_WEB_URLS.some(permitida => url.includes(permitida));
}

// Listener para o evento onUpdated que é acionado quando uma guia é atualizada
chrome.tabs.onUpdated.addListener(function onReload (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && verificaUrlPermitida(tab.url)) {
    chrome.pageAction.show(tabId);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (verificaUrlPermitida(tabs[0].url)) {
        chrome.tabs.sendMessage(tabs[0].id, "");
      }
    });
  }
});

chrome.action.onClicked.addListener(function onClick (tab) {
  chrome.tabs.create({ url: PONTO_WEB_URLS[0], active: true });
});
