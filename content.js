function atualizarRelogio() {
  let hora = null;
  $.ajaxSetup({ async: false });
  $.get("/Pontoweb/Home/obterProximaBatida", function (data, status) {
    hora = $(data).find("#DataHora").val().split(" ")[1];
  });
  $(".bnb-ponto-web-relogio").text(hora)
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
    this._batida1 = batidas.length > 0 ? convertHourToMinute(batidas[0].textContent.split(" ")[1]) : null;
    this._batida2 = batidas.length > 1 ? convertHourToMinute(batidas[1].textContent.split(" ")[1]) : null;
    this._batida3 = batidas.length > 2 ? convertHourToMinute(batidas[2].textContent.split(" ")[1]) : null;
    this._batida4 = batidas.length > 3 ? convertHourToMinute(batidas[3].textContent.split(" ")[1]) : null;
    this._quantidade = batidas.length;
    this.obterCargaHoraria();
    this.calcularPrevisaoSaida();
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
  calcularPrevisaoSaida() {
    if (this.quantidade < 3) {
      if (this.cargaHoraria == 360) {
        this._batida4 = this.batida1 + this.cargaHoraria - 15;
      } else {
        this._batida4 = this.batida1 + this.cargaHoraria + 30;
      }
    } else {
      this._batida4 = this.batida1 + this.cargaHoraria + this.batida3 - this.batida2 - (this.cargaHoraria == 360 ? 15 : 0);
    }
    return this.batida4;
  }
  mostrarSaidaEstimada() {
    if (this.quantidade > 0)
      $(".label").parent().append('<span class="label label-default bnb-ponto-web">Saída estimada: <strong>' + convertMinutesToHour(this.batida4) + '<strong></span> ');
  }
  mostrarDuracaoIntervalo() {
    if (this.quantidade > 2)
      $(".label").parent().append('<span class="label label-default bnb-ponto-web">Duração do Intervalo: <strong>' + convertMinutesToHour(this.batida3 - this.batida2) + '<strong></span> ');
  }
  mostrarPrevisaoRetorno() {
    if (this.quantidade == 2)
      if (this.cargaHoraria == 360) {
        $(".label").parent().append('<span class="label label-default bnb-ponto-web">Prev. Retorno Intervalo: <strong>' + convertMinutesToHour(this.batida2 + 15) + '<strong></span> ');
      } else {
        $(".label").parent().append('<span class="label label-default bnb-ponto-web">Prev. Retorno Intervalo: <strong>' + convertMinutesToHour(this.batida2 + 30) + '<strong></span> ');
      }
  }
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    $(document).ready(function () {
      // Criando label do horário
      $(".label").parent().append('<span class="label label-default bnb-ponto-web-relogio"></span> ');
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
}