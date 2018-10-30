chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    $(document).ready(function () {
      calcularSaida()
    });
    sendResponse();
  }
);

function atualizarHora() {
  var dataHora = getDataHora();
  //console.log("Data/Hora: " + dataHora);
  $(".bnb-ponto-web-relogio").text(dataHora)

  setTimeout("atualizarHora()", 30 * 1000);
}

function calcularSaida() {
  $(".label").parent().append('<span class="label label-default bnb-ponto-web-relogio"></span> ');
  atualizarHora();

  var cargaHoraria = getCargaHoraria();
  console.log("Carga Horária: " + cargaHoraria);

  var batidas = $("#batidas").find("td");
  var batida1 = batidas[0].textContent.split(" ")[1];
  if (batidas.length >= 3) {

    var batida2 = batidas[1].textContent.split(" ")[1];
    var batida3 = batidas[2].textContent.split(" ")[1];
    var batida4 = convertHourToMinute(batida1) + convertHourToMinute(cargaHoraria) + convertHourToMinute(batida3) - convertHourToMinute(batida2) - (cargaHoraria == "6:00" ? 15 : 0);
    $(".label").parent().append('<span class="label label-default bnb-ponto-web">Saída estimada: <strong>' + convertMinutesToHour(batida4) + '<strong></span> ');
    opcoes(cargaHoraria, batida2, batida3, batidas.length);
  } else if (batidas.length >= 1) {

    var batida4;
    if (cargaHoraria == "6:00") {
      batida4 = convertHourToMinute(batida1) + convertHourToMinute(cargaHoraria) - convertHourToMinute("00:15");
    } else {
      batida4 = convertHourToMinute(batida1) + convertHourToMinute(cargaHoraria) + convertHourToMinute("0:30");
    }
    $(".label").parent().append('<span class="label label-default bnb-ponto-web">Saída padrão: <strong>' + convertMinutesToHour(batida4) + '<strong></span> ');
    opcoes(cargaHoraria, batida2, batida3, batidas.length);
  }
}

function getDataHora() {
  var dataHora;
  $.ajaxSetup({ async: false });
  $.get("/Pontoweb/Home/obterProximaBatida", function (data, status) {
    dataHora = $(data).find("#DataHora").val().split(" ")[1];
  });
  return dataHora;
}

function getCargaHoraria() {
  var cargaHoraria;
  $.ajaxSetup({ async: false });
  $.get("/Pontoweb/Home/obterProximaBatida", function (data, status) {
    cargaHoraria = $(data).filter("#CargaHorariaFuncionario").val() + ":00";
  });
  return cargaHoraria;
}

function convertHourToMinute(time) {
  var arrTime = time.toString().split(":");
  return parseInt(arrTime[0] * 60) + parseInt(arrTime[1]);
}

function convertMinutesToHour(minutes) {
  var hour = parseInt(minutes) / 60;
  var minute = parseInt(minutes) % 60;
  if (minute < 10)
    return parseInt(hour) + ":0" + parseInt(minute);
  else
    return parseInt(hour) + ":" + parseInt(minute);
}

function opcoes(cargaHoraria, batida2, batida3, qtdBatidas) {
  chrome.storage.sync.get('previsaoRetorno', function (result) {
    opPrevisao = result.previsaoRetorno;
    //console.log(opPrevisao);
    if (opPrevisao && qtdBatidas < 3) {
      if (cargaHoraria == "6:00")
        $(".label").parent().append('<span class="label label-default bnb-ponto-web">Prev. Retorno Intervalo: <strong>' + convertMinutesToHour(convertHourToMinute(batida2) + 15) + '<strong></span> ');
      else
        $(".label").parent().append('<span class="label label-default bnb-ponto-web">Prev. Retorno Intervalo: <strong>' + convertMinutesToHour(convertHourToMinute(batida2) + 30) + '<strong></span> ');
    }
  });
  chrome.storage.sync.get('duracaoIntervalo', function (result) {
    opDuracao = result.duracaoIntervalo;
    //console.log(opDuracao);
    if (opDuracao)
      $(".label").parent().append('<span class="label label-default bnb-ponto-web">Duração do Intervalo: <strong>' + convertMinutesToHour(convertHourToMinute(batida3) - convertHourToMinute(batida2)) + '<strong></span> ');
  });
}