document.addEventListener('DOMContentLoaded', function () {
  loadSavedOptions();
  var previsao = document.getElementById('previsaoRetorno');
  var duracao = document.getElementById('duracaoIntervalo');
  // onClick's logic below:
  previsao.addEventListener('click', function () {
    saveOptions();
  });
  duracao.addEventListener('click', function () {
    saveOptions();
  });
});

function saveOptions() {
  chrome.storage.sync.set({ previsaoRetorno: document.getElementById('previsaoRetorno').checked });
  chrome.storage.sync.set({ duracaoIntervalo: document.getElementById('duracaoIntervalo').checked });
}


function loadSavedOptions() {
  chrome.storage.sync.get('previsaoRetorno', function (result) {
    opPrevisao = result.previsaoRetorno;
    if (opPrevisao)
      document.getElementById('previsaoRetorno').checked = true;
  });

  chrome.storage.sync.get('duracaoIntervalo', function (result) {
    opDuracao = result.duracaoIntervalo;
    if (opDuracao)
      document.getElementById('duracaoIntervalo').checked = true;
  });
}
