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
    this._batida1 = convertHourToMinute(this.batidas[0]);
    this._batida2 = convertHourToMinute(this.batidas[1]);
    this._batida3 = convertHourToMinute(this.batidas[2]);
    this._batida4 = convertHourToMinute(this.batidas[3]);
    this._saidaEstimada = null;
    this._quantidade = this.batidas.length;
    this.calcularSaidaEstimada();
  }
  get batidas() {
    return this._batidas;
  }
  get batida1() {
    return this._batida1;
  }
  get batida2() {
    return this._batida2;
  }
  get batida3() {
    return this._batida3;
  }
  get batida4() {
    return this._batida4;
  }
  get saidaEstimada() {
    return this._saidaEstimada;
  }
  get quantidade() {
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
  calcularSaidaEstimada() {
    if (this.quantidade < 3) {
      this._saidaEstimada = this.batida1 + this.cargaHoraria - (this.cargaHoraria == 360 ? 15 : -30);
    } else {
      this._saidaEstimada = this.batida1 + this.cargaHoraria + this.batida3 - this.batida2 - (this.cargaHoraria == 360 ? 15 : 0);
    }
    return this.saidaEstimada;
  }
  mostrarSaidaEstimada() {
    if (this.quantidade > 0)
      $(".label").parent().append('<span class="label label-default">Saída estimada: <strong>' + convertMinutesToHour(this.saidaEstimada) + '<strong></span> ');
  }
  mostrarPrevisaoRetorno() {
    if (this.quantidade == 2)
      $(".label").parent().append('<span class="label label-default ">Prev. Retorno Intervalo: <strong>' + convertMinutesToHour(this.batida2 + (this.cargaHoraria == 360 ? 15 : 30)) + '<strong></span> ');
  }
  mostrarDuracaoIntervalo() {
    if (this.quantidade > 2)
      $(".label").parent().append('<span class="label label-default">Duração do Intervalo: <strong>' + convertMinutesToHour(this.batida3 - this.batida2) + '<strong></span> ');
  }
  mostrarHoraExtra() {
    if (this.quantidade >= 3) {
      let baseComparacao = this.batida4 == null ? convertHourToMinute(getDateTime()) : this.batida4;
      if (this.saidaEstimada < baseComparacao) {
        $(".label").parent().append('<span class="label label-default">Hora Extra: <strong>' + convertMinutesToHour(baseComparacao - this.saidaEstimada) + '<strong></span> ');
      } else if (this.saidaEstimada > baseComparacao) {
        $(".label").parent().append('<span class="label label-default">Hora à Compensar: <strong>' + convertMinutesToHour(this.saidaEstimada - baseComparacao) + '<strong></span> ');
      }
    }
  }
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    $(document).ready(function () {
      // Criando label do horário
      $(".label").parent().append('<span id="bnb-ponto-web-relogio" class="label label-default"></span> ');
      atualizarRelogio();

      // Calculando hora de saída
      let batidas = new Batidas();
      batidas.mostrarSaidaEstimada();
      verificarOpcoesUsuario(batidas);
    });
    sendResponse();
  }
);

function verificarOpcoesUsuario(batidas) {
  chrome.storage.sync.get('previsaoRetorno', function (result) {
    if (result.previsaoRetorno) {
      batidas.mostrarPrevisaoRetorno();
    }
  });
  chrome.storage.sync.get('duracaoIntervalo', function (result) {
    if (result.duracaoIntervalo) {
      batidas.mostrarDuracaoIntervalo();
    }
  });
  chrome.storage.sync.get('calcularHoraExtra', function (result) {
    if (result.calcularHoraExtra) {
      batidas.mostrarHoraExtra();
    }
  });
}