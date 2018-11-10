function formatLeftZero(num) {
  if (parseInt(num) < 10)
    return "0" + num;
  return num;
}

function getDateTime() {
  let dateTime = null;
  $.ajaxSetup({ async: false });
  $.get("/Pontoweb/Home/getTime", function (data, status) {
    dateTime = (status == "success") ? new Date(data) : null;
  });
  return dateTime;
}

function atualizarRelogio() {
  let dateTime = getDateTime();
  let horaFormatada = formatLeftZero(dateTime.getHours()) + ":" + formatLeftZero(dateTime.getMinutes()) + ":" + formatLeftZero(dateTime.getSeconds());
  $("#bnb-ponto-web-relogio").text(horaFormatada);
  setTimeout("atualizarRelogio()", 30 * 1000);
  console.log("triggering atualizarRelogio()");
}

function convertMinutesToHour(minutes) {
  if (minutes == null || minutes == "")
    return null;
  let hour = parseInt(minutes / 60);
  let minute = parseInt(minutes % 60);
  return formatLeftZero(hour) + ":" + formatLeftZero(minute);
}

function convertHourToMinute(dateTime) {
  if (dateTime == null || dateTime == "")
    return null;

  return parseInt(dateTime.getHours() * 60) + parseInt(dateTime.getMinutes());
}

class Batidas {
  constructor() {
    this.obterBatidas();
    this.obterCargaHoraria();
    this.obterSaidaEstimada();
  }
  get batidas() {
    return this._batidas;
  }
  get batida1() {
    if (this._batida1 == null)
      this._batida1 = convertHourToMinute(this.batidas[0]);
    return this._batida1;
  }
  get batida2() {
    if (this._batida2 == null)
      this._batida2 = convertHourToMinute(this.batidas[1]);
    return this._batida2;
  }
  get batida3() {
    if (this._batida3 == null)
      this._batida3 = convertHourToMinute(this.batidas[2]);
    return this._batida3;
  }
  get batida4() {
    if (this._batida4 == null)
      this._batida4 = convertHourToMinute(this.batidas[3]);
    return this._batida4;
  }
  get saidaEstimada() {
    return this._saidaEstimada;
  }
  get quantidade() {
    if (this._quantidade == null)
      this._quantidade = this.batidas.length;
    return this._quantidade;
  }
  get cargaHoraria() {
    return this._cargaHoraria;
  }
  obterBatidas() {
    if (this._batidas == null) {
      var batidas = [];
      $.ajaxSetup({ async: false });
      $.get("/Pontoweb/api/batidas", function (data, status) { data.map(batida => batidas.push(new Date(batida.datahora))); });
    }
    this._batidas = batidas;
  }
  obterCargaHoraria() {
    if (this._cargaHoraria == null) {
      var cargaHoraria;
      $.ajaxSetup({ async: false });
      $.get("/Pontoweb/Home/obterProximaBatida", function (data, status) {
        let cargaHorariaFuncionario = $(data).filter("#CargaHorariaFuncionario").val();
        cargaHoraria = parseInt(cargaHorariaFuncionario) * 60;
      });
    }
    this._cargaHoraria = cargaHoraria;
  }
  obterSaidaEstimada() {
    if (this.quantidade < 3)
      this._saidaEstimada = this.batida1 + this.cargaHoraria - (this.cargaHoraria == 360 ? 15 : -30);
    else
      this._saidaEstimada = this.batida1 + this.cargaHoraria + this.batida3 - this.batida2 - (this.cargaHoraria == 360 ? 15 : 0);
  }
  mostrarSaidaEstimada() {
    $("#bnb-ponto-web-info-saida-estimada").remove();
    if (this.quantidade > 0)
      $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-saida-estimada" class="label">Saída estimada: <strong>' + convertMinutesToHour(this.saidaEstimada) + '</strong></span>');
  }
  mostrarPrevisaoRetorno() {
    $("#bnb-ponto-web-info-previsao-retorno").remove();
    if (this.quantidade == 2)
      $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-previsao-retorno" class="label">Prev. Retorno Intervalo: <strong>' + convertMinutesToHour(this.batida2 + (this.cargaHoraria == 360 ? 15 : 30)) + '</strong></span>');
  }
  mostrarDuracaoIntervalo() {
    $("#bnb-ponto-web-info-duracao-intervalo").remove();
    if (this.quantidade > 2)
      $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-duracao-intervalo" class="label">Duração do Intervalo: <strong>' + convertMinutesToHour(this.batida3 - this.batida2) + '</strong></span>');
  }
  mostrarHoraExtra() {
    $("#bnb-ponto-web-info-hora-extra").remove();
    if (this.quantidade >= 3) {
      let baseComparacao = this.batida4 == null ? convertHourToMinute(getDateTime()) : this.batida4;
      if (this.saidaEstimada < baseComparacao)
        $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-hora-extra" class="label" title="Pressione F5 para atualizar">Extra: <strong>' + convertMinutesToHour(baseComparacao - this.saidaEstimada) + '</strong></span>');
      else if (this.saidaEstimada > baseComparacao)
        $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-hora-extra" class="label" title="Pressione F5 para atualizar">Compensar: <strong>' + convertMinutesToHour(this.saidaEstimada - baseComparacao) + '</strong></span>');
    }
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  $(document).ready(function () {
    // Criando label do horário
    $("#bnb-ponto-web-relogio").remove();
    $("body > div.container > div:nth-child(3) > h3").append('<span id="bnb-ponto-web-relogio" class="label label-primary" />');
    atualizarRelogio();

    // Criando label das informações
    $("#bnb-ponto-web-info").remove();
    $("body > div.container > div:nth-child(3) > h3").append('<div id="bnb-ponto-web-info" style="margin-top: 10px; clear: both;" />');

    // Calculando hora de saída
    verificarOpcoesUsuario();

    // Correção de padding
    $("body > div.container > div:nth-child(3)").css("padding-bottom", "10px");

    // Adicionando trigger na tabela
    document.getElementById("batidas").addEventListener('DOMNodeInserted', function (event) {
      verificarOpcoesUsuario();
    });
  });
  sendResponse();
});

function verificarOpcoesUsuario() {
  let batidas = new Batidas();

  chrome.storage.sync.get('previsaoRetorno', function (result) {
    if (result.previsaoRetorno)
      batidas.mostrarPrevisaoRetorno();
  });
  chrome.storage.sync.get('duracaoIntervalo', function (result) {
    if (result.duracaoIntervalo)
      batidas.mostrarDuracaoIntervalo();
  });
  chrome.storage.sync.get('saidaEstimada', function (result) {
    if (result.saidaEstimada)
      batidas.mostrarSaidaEstimada();
  });
  chrome.storage.sync.get('calcularHoraExtra', function (result) {
    if (result.calcularHoraExtra)
      batidas.mostrarHoraExtra();
  });
  setTimeout("verificarOpcoesUsuario()", 60 * 1000);
}