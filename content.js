
// URLs para as requisições
const URL_HORA_SERVIDOR = "/Pontoweb/Home/getTime";
const URL_CARGA_HORARIA_SERVIDOR = "/Pontoweb/Home/obterProximaBatida";
const URL_BATIDAS_SERVIDOR = "/Pontoweb/api/batidas";

// Variáveis para sincronização de tempo
let horaServidor = null;
let ultimaBuscaHoraServidor = null;
const TOLERANCIA_SINCRONIZACAO_HORA = 5 * 60 * 1000; // 5 minutos em milissegundos


/**
 * Realiza uma requisição assíncrona para obter a hora do servidor.
 * Se a requisição for bem-sucedida, a hora do servidor é extraída dos dados
 * e armazenada nas variáveis 'horaServidor' e 'ultimaBuscaHoraServidor'.
 * Em caso de erro, uma mensagem de erro é registrada no console.
 */
async function obterHoraServidor() {
  try {
    const resposta = await fetch(URL_HORA_SERVIDOR);
    if (resposta.ok) {
      const dados = await resposta.text();
      const hora = dados.split(" ")[1];
      horaServidor = new Date(`1970-01-01T${hora}`);
      ultimaBuscaHoraServidor = new Date();
    }
  } catch (erro) {
    console.error("Falha ao buscar a hora do servidor:", erro);
  }
}

/**
 * Obtém o horário atual. Na primeira chamada, o horário é obtido do servidor.
 * Nas chamadas subsequentes, o horário é calculado com base no tempo decorrido
 * desde a primeira chamada. O horário é sincronizado com o servidor usando a
 * constante 'TOLERANCIA_SINCRONIZACAO_HORA'.
 */
function obterHoraAtual() {
  if (horaServidor === null || (new Date() - ultimaBuscaHoraServidor) > TOLERANCIA_SINCRONIZACAO_HORA) {
    obterHoraServidor();
  }

  const horaAtual = new Date(horaServidor.getTime() + (Date.now() - ultimaBuscaHoraServidor));

  return horaAtual;
}

/**
 * Realiza uma requisição assíncrona para obter a carga horária do servidor.
 * Se a requisição for bem-sucedida, a carga horária do funcionário é extraída dos dados,
 * convertida para minutos e retornada. Em caso de erro na requisição ou durante o processo,
 * mensagens de erro são registradas no console e a função retorna null.
 */
async function obterCargaHorariaSevidor() {
  let cargaHoraria = null;
  try {
    const response = await fetch(URL_CARGA_HORARIA_SERVIDOR);
    if (response.ok) {
      const data = await response.text();
      const cargaHorariaFuncionario = $(data).filter("#CargaHorariaFuncionario").val();
      cargaHoraria = parseInt(cargaHorariaFuncionario) * 60;
    } else {
      console.error("Falha ao obter dados da carga horária:", response.statusText);
    }
  } catch (error) {
    console.error("Erro durante a requisição:", error);
  }

  return cargaHoraria;
}

/**
 * Realiza uma requisição assíncrona para obter as batidas registradas no servidor.
 * Se a requisição for bem-sucedida, os dados de batida são convertidos para objetos Date,
 * considerando um deslocamento de fuso horário de -03:00. Esses objetos Date são mapeados
 * e retornados em um array. Em caso de erro na requisição ou durante o processo,
 * mensagens de erro são registradas no console e a função retorna um array vazio.
 */
async function obterBatidasServidor() {
  try {
    const response = await fetch(URL_BATIDAS_SERVIDOR);
    
    if (response.ok) {
      const data = await response.json();
      return data.map(batida => new Date(`${batida.datahora}-03:00`));
    } else {
      console.error("Falha ao obter batidas:", response.statusText);
      return [];
    }
  } catch (error) {
    console.error("Erro durante a requisição:", error);
    return [];
  }
}









// Código original ainda não reescrito
var batidas = null;

function formatLeftZero(num) {
  if (parseInt(num) < 10)
    return "0" + num;
  return num;
}

function getDateTime() {
  let dateTime = null;
  $.ajaxSetup({ async: false });
  $.get("/Pontoweb/Home/getTime", function (data, status) {
    dateTime = (status == "success") ? data.split(" ")[1] : null;
  });
  return dateTime;
}

function atualizarRelogio() {
  $("#bnb-ponto-web-relogio").text(getDateTime());

  console.log("Atualizando relógio");
  setTimeout("atualizarRelogio()", 60 * 1000);
}

function convertMinutesToHour(minutes) {
  if (minutes == null || minutes == "")
    return null;
  let hour = parseInt(minutes / 60);
  let minute = parseInt(minutes % 60);
  return formatLeftZero(hour) + ":" + formatLeftZero(minute);
}

function convertDateToMinute(dateTime) {
  if (dateTime == null || dateTime == "")
    return null;

  return parseInt(dateTime.getHours() * 60) + parseInt(dateTime.getMinutes());
}

function convertTimeToMinute(time) {
  if (time == null || time == "")
    return null;

  return (parseInt(time.split(":")[0]) * 60) + parseInt(time.split(":")[1]);
}

class Batidas {
  constructor() {
    this.obterCargaHoraria();
    this.atualizarBatidas();
  }
  get batidas() {
    return this._batidas;
  }
  get batida1() {
    if (this._batida1 == null)
      this._batida1 = convertDateToMinute(this.batidas[0]);
    return this._batida1;
  }
  get batida2() {
    if (this._batida2 == null)
      this._batida2 = convertDateToMinute(this.batidas[1]);
    return this._batida2;
  }
  get batida3() {
    if (this._batida3 == null)
      this._batida3 = convertDateToMinute(this.batidas[2]);
    return this._batida3;
  }
  get batida4() {
    if (this._batida4 == null)
      this._batida4 = convertDateToMinute(this.batidas[3]);
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
  atualizarBatidas() {
    console.log("Atualizando batidas");

    this._batidas = null;
    this._quantidade = null;
    this.obterBatidas();
    this.obterSaidaEstimada();
    this.mostrarDuracaoIntervalo();
    this.mostrarPrevisaoRetorno();
    this.mostrarSaidaEstimada();
    this.mostrarHoraExtra();
  }
  atualizarHoraExtra() {
    console.log("Atualizando horas extra / à compensar");

    this.mostrarHoraExtra();
  }
  obterBatidas() {
    if (this._batidas == null) {
      var b = [];
      $.ajaxSetup({ async: false });
      $.get("/Pontoweb/api/batidas", function (data, status) { data.map(batida => b.push(new Date(batida.datahora + "-03:00"))); });
    }
    this._batidas = b;
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
      this._saidaEstimada = this.batida1 + this.cargaHoraria - (this.cargaHoraria == 360 ? 0 : -30);
    else
      this._saidaEstimada = this.batida1 + this.cargaHoraria + this.batida3 - this.batida2 - (this.cargaHoraria == 360 ? 15 : 0);
  }
  mostrarSaidaEstimada() {
    $("#bnb-ponto-web-info-saida-estimada").remove();

    if (this.quantidade > 0)
      $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-saida-estimada" class="label" title="' + (this.quantidade < 3 ? ((this.cargaHoraria == 360) ? "Considerando 15 min de intervalo" : "Considerando 30 min de intervalo") : "") + '">Saída estimada: <strong>' + convertMinutesToHour(this.saidaEstimada) + '</strong></span>');
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
    $("#bnb-ponto-web-info-hora-extra, #bnb-ponto-web-info-hora-extra-maxima").remove();

    if (this.quantidade >= 3) {
      let baseComparacao = this.batida4 == null ? convertTimeToMinute(getDateTime()) : this.batida4;
      if (this.saidaEstimada < baseComparacao) {
        $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-hora-extra" class="label">Extra: <strong>' + convertMinutesToHour(baseComparacao - this.saidaEstimada) + '</strong></span>');
        $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-hora-extra-maxima" class="label">Limite de Saída: <strong>' + convertMinutesToHour(this.saidaEstimada + 120 + (this.cargaHoraria == 360 ? 10 : 0)) + '</strong></span>');
      } else if (this.saidaEstimada > baseComparacao)
        $("#bnb-ponto-web-info").append('<span id="bnb-ponto-web-info-hora-extra" class="label">Compensar: <strong>' + convertMinutesToHour(this.saidaEstimada - baseComparacao) + '</strong></span>');
    }
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  $(document).ready(function () {

    // Criando label das informações
    $("#bnb-ponto-web-relogio, #bnb-ponto-web-info").remove();
    $("body > div.container > div:nth-child(3) > h3").append('<span id="bnb-ponto-web-relogio" class="label label-primary" />');
    $("body > div.container > div:nth-child(3) > h3").append('<div id="bnb-ponto-web-info" style="margin-top: 10px; clear: both;" />');
    $("body > div.container > div:nth-child(3)").css("padding-bottom", "10px");
    atualizarRelogio();

    // Instanciando Batidas
    batidas = new Batidas();
    setInterval("batidas.atualizarHoraExtra()", 60 * 1000);

    // Adicionando trigger na tabela
    document.getElementById("batidas").addEventListener('DOMNodeInserted', function (event) {
      batidas.atualizarBatidas();
    });

    $("#new-batida").click(function () { setTimeout("$('#CaptchaCode').focus()", 1000) });

  });
  sendResponse();
});
