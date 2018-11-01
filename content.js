function atualizarRelogio() {
  let hora = null;
  $.ajaxSetup({ async: false });
  $.get("/Pontoweb/Home/obterProximaBatida", function (data, status) {
    hora = $(data).find("#DataHora").val().split(" ")[1];
  });
  $("#bnb-ponto-web-relogio").text(hora)
  setTimeout("atualizarRelogio()", 30 * 1000);
}

function convertMinutesToHour(minutes) {
  if (minutes == null || minutes == "")
    return null;
  let hour = parseInt(minutes / 60);
  let minute = parseInt(minutes % 60);
  return ((hour < 10) ? "0" + hour : hour) + ":" + ((minute < 10) ? "0" + minute : minute);
}

function convertHourToMinute(time) {
  if (time == null || time == "")
    return null;

  let arrTime = time.toString().split(":");
  return parseInt(arrTime[0] * 60) + parseInt(arrTime[1]);
}

class Batidas {
  constructor(batidas) {
    this.obterCargaHoraria();
    this._batida1 = batidas.length > 0 ? convertHourToMinute(batidas[0].textContent.split(" ")[1]) : null;
    this._batida2 = batidas.length > 1 ? convertHourToMinute(batidas[1].textContent.split(" ")[1]) : null;
    this._batida3 = batidas.length > 2 ? convertHourToMinute(batidas[2].textContent.split(" ")[1]) : null;
    this._batida4 = batidas.length > 3 ? convertHourToMinute(batidas[3].textContent.split(" ")[1]) : null;
    this._saidaEstimada = null;
    this._quantidade = batidas.length;
    this.calcularSaidaEstimada();
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
    if (this.quantidade == 4) {
      if (this.saidaEstimada < this.batida4) {
        $(".label").parent().append('<span class="label label-default">Hora Extra: <strong>' + convertMinutesToHour(this.batida4 - this.saidaEstimada) + '<strong></span> ');
      } else if (this.saidaEstimada > this.batida4) {
        $(".label").parent().append('<span class="label label-default">Hora à Compensar: <strong>' + convertMinutesToHour(this.saidaEstimada - this.batida4) + '<strong></span> ');
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
      // $("#batidas").find("td:last").remove();
      let batidas = new Batidas($("#batidas").find("td"));
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