document.addEventListener('DOMContentLoaded', function () {
  loadSavedOptions();
  document.getElementById('previsaoRetorno').addEventListener('click', function () { saveOptions(); });
  document.getElementById('duracaoIntervalo').addEventListener('click', function () { saveOptions(); });
  document.getElementById('calcularHoraExtra').addEventListener('click', function () { saveOptions(); });
  document.getElementById('saidaEstimada').addEventListener('click', function () { saveOptions(); });
});

function saveOptions() {
  chrome.storage.sync.set({ previsaoRetorno: document.getElementById('previsaoRetorno').checked });
  chrome.storage.sync.set({ duracaoIntervalo: document.getElementById('duracaoIntervalo').checked });
  chrome.storage.sync.set({ calcularHoraExtra: document.getElementById('calcularHoraExtra').checked });
  chrome.storage.sync.set({ saidaEstimada: document.getElementById('saidaEstimada').checked });
}


function loadSavedOptions() {
  chrome.storage.sync.get('previsaoRetorno', function (result) {
    if (result.previsaoRetorno)
      document.getElementById('previsaoRetorno').checked = true;
  });
  chrome.storage.sync.get('duracaoIntervalo', function (result) {
    if (result.duracaoIntervalo)
      document.getElementById('duracaoIntervalo').checked = true;
  });
  chrome.storage.sync.get('calcularHoraExtra', function (result) {
    if (result.calcularHoraExtra)
      document.getElementById('calcularHoraExtra').checked = true;
  });
  chrome.storage.sync.get('saidaEstimada', function (result) {
    // if (result.calcularHoraExtra)
    document.getElementById('saidaEstimada').checked = true;
  });
}
