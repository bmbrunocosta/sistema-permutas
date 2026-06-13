const URL_API = "https://script.google.com/macros/s/AKfycbymMw34H2OBJxter8EuVRDFOEIp71qoozdjR5ZbDc-gtAiiinxed2ObSxksqOg6U6Tuyw/exec";

const rgEntra = document.getElementById("rgEntra");
const rgSai = document.getElementById("rgSai");
const idEntra = document.getElementById("idEntra");
const idSai = document.getElementById("idSai");
const form = document.getElementById("formPermuta");
const btnEnviar = document.getElementById("btnEnviar");
const mensagem = document.getElementById("mensagem");
const dataServico = document.getElementById("dataServico");
const avisoPrazoPermuta = document.getElementById("avisoPrazoPermuta");

const btnAbrirConsulta = document.getElementById("btnAbrirConsulta");
const areaConsulta = document.getElementById("areaConsulta");
const rgConsulta = document.getElementById("rgConsulta");
const btnConsultar = document.getElementById("btnConsultar");
const resultadoConsulta = document.getElementById("resultadoConsulta");

let militaresPorRG = {};
let timerConsultaEntra = null;
let timerConsultaSai = null;

carregarMilitares();

async function chamarApi(acao, dados = {}) {
  const resposta = await fetch(URL_API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      acao: acao,
      dados: dados
    })
  });

  if (!resposta.ok) {
    throw new Error("Falha de comunicação com o servidor.");
  }

  const resultado = await resposta.json();

  if (!resultado.sucesso) {
    throw new Error(resultado.mensagem || "Erro ao executar a ação.");
  }

  return resultado;
}

async function carregarMilitares() {
  try {
    const resultado = await chamarApi("carregarMilitares");
    const militares = resultado.militares || [];

    militaresPorRG = {};

    militares.forEach((militar) => {
      militaresPorRG[militar.rg] = militar;
    });

    console.log("Militares carregados:", militares.length);

  } catch (erro) {
    militaresPorRG = {};
    console.log("Erro ao carregar militares:", erro.message);

    mensagem.textContent =
      "Erro ao carregar a base de militares. Verifique a conexão ou o link da API.";
    mensagem.className = "mensagem erro";
  }
}

rgEntra.addEventListener("input", () => {
  tratarDigitacaoRG(rgEntra, idEntra, "entra");
});

rgSai.addEventListener("input", () => {
  tratarDigitacaoRG(rgSai, idSai, "sai");
});

rgEntra.addEventListener("blur", () => {
  mostrarIdentificacaoLocal(rgEntra, idEntra);
});

rgSai.addEventListener("blur", () => {
  mostrarIdentificacaoLocal(rgSai, idSai);
});

dataServico.addEventListener("change", () => {
  verificarPrazoPermuta();
});

dataServico.addEventListener("input", () => {
  verificarPrazoPermuta();
});

btnAbrirConsulta.addEventListener("click", () => {
  areaConsulta.classList.toggle("ativa");

  if (areaConsulta.classList.contains("ativa")) {
    rgConsulta.focus();
  }
});

rgConsulta.addEventListener("input", () => {
  rgConsulta.value = limparRG(rgConsulta.value);
});

btnConsultar.addEventListener("click", () => {
  consultarPermutasFuturas();
});

resultadoConsulta.addEventListener("click", (e) => {
  const botaoCancelar = e.target.closest(".botao-cancelar");
  const botaoEnviarCodigo = e.target.closest(".botao-enviar-codigo");
  const botaoConfirmarCancelamento = e.target.closest(".botao-confirmar-cancelamento");

  if (botaoCancelar) {
    const linha = botaoCancelar.dataset.linha;
    const area = document.getElementById("cancelamento-" + linha);

    if (area) {
      area.classList.toggle("ativa");
    }

    return;
  }

  if (botaoEnviarCodigo) {
    solicitarCodigoCancelamento(
      botaoEnviarCodigo.dataset.linha,
      botaoEnviarCodigo.dataset.rgConsulta
    );
    return;
  }

  if (botaoConfirmarCancelamento) {
    confirmarCancelamento(
      botaoConfirmarCancelamento.dataset.linha,
      botaoConfirmarCancelamento.dataset.rgConsulta
    );
    return;
  }
});

function limparRG(valor) {
  return String(valor || "").replace(/\D/g, "").slice(0, 7);
}

function tratarDigitacaoRG(input, elementoResultado, tipo) {
  input.value = limparRG(input.value);

  elementoResultado.textContent = "";
  elementoResultado.classList.remove("erro-identificacao");

  if (tipo === "entra") {
    clearTimeout(timerConsultaEntra);

    timerConsultaEntra = setTimeout(() => {
      mostrarIdentificacaoLocal(input, elementoResultado);
    }, 600);
  }

  if (tipo === "sai") {
    clearTimeout(timerConsultaSai);

    timerConsultaSai = setTimeout(() => {
      mostrarIdentificacaoLocal(input, elementoResultado);
    }, 600);
  }
}

function mostrarIdentificacaoLocal(input, elementoResultado) {
  const rg = limparRG(input.value);

  elementoResultado.textContent = "";
  elementoResultado.classList.remove("erro-identificacao");

  if (rg.length < 4) return;

  const militar = militaresPorRG[rg];

  if (militar) {
    elementoResultado.textContent = militar.identificacao;
    elementoResultado.classList.remove("erro-identificacao");
  }
}

function verificarPrazoPermuta() {
  const valorData = dataServico.value;

  avisoPrazoPermuta.textContent = "";
  avisoPrazoPermuta.classList.remove("ativo");

  if (!valorData) return;

  const partes = valorData.split("-");

  if (partes.length !== 3) return;

  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);

  const dataSelecionada = new Date(ano, mes - 1, dia, 0, 0, 0);

  const limiteMinimo = new Date();
  limiteMinimo.setHours(limiteMinimo.getHours() + 48);

  if (dataSelecionada < limiteMinimo) {
    avisoPrazoPermuta.textContent =
      "Atenção: esta solicitação está fora do prazo regulamentar de 48 horas de antecedência. A permuta será registrada, mas ficará sujeita à análise administrativa.";
    avisoPrazoPermuta.classList.add("ativo");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  verificarPrazoPermuta();

  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";
  mensagem.className = "mensagem";
  mensagem.textContent = "";

  const dados = {
    email: document.getElementById("email").value,
    dataServico: document.getElementById("dataServico").value,
    rgEntra: document.getElementById("rgEntra").value,
    rgSai: document.getElementById("rgSai").value,
    observacoes: document.getElementById("observacoes").value
  };

  try {
    const resultado = await chamarApi("enviarPermuta", dados);
    const resposta = resultado.resposta;

    mensagem.innerHTML =
      escaparHtml(resposta.mensagem) +
      "<br><br><strong>Data do serviço:</strong> " + formatarDataBrasileira(dados.dataServico) +
      "<br><strong>Entra:</strong> " + escaparHtml(resposta.militarEntra) +
      "<br><strong>Sai:</strong> " + escaparHtml(resposta.militarSai);

    mensagem.className = "mensagem sucesso";

    form.reset();
    idEntra.textContent = "";
    idSai.textContent = "";
    avisoPrazoPermuta.textContent = "";
    avisoPrazoPermuta.classList.remove("ativo");

    if (resposta.linhaProcessamento) {
      tentarProcessarPermuta(resposta.linhaProcessamento, 1);
    } else {
      console.log("Linha de processamento não retornada.");
    }

  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = "mensagem erro";
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Enviar Solicitação";
  }
});

async function consultarPermutasFuturas() {
  const rg = limparRG(rgConsulta.value);

  resultadoConsulta.innerHTML = "";

  if (rg.length < 4) {
    resultadoConsulta.innerHTML =
      '<div class="mensagem-consulta">Informe um RG válido para consultar.</div>';
    return;
  }

  btnConsultar.disabled = true;
  btnConsultar.textContent = "Consultando...";

  try {
    const resultado = await chamarApi("consultarPermutasFuturas", {
      rg: rg
    });

    exibirPermutasFuturas(resultado.resposta || []);

  } catch (erro) {
    resultadoConsulta.innerHTML =
      '<div class="mensagem-consulta">' + escaparHtml(erro.message) + '</div>';
  } finally {
    btnConsultar.disabled = false;
    btnConsultar.textContent = "Consultar";
  }
}

function exibirPermutasFuturas(permutas) {
  console.log("Permutas recebidas:", permutas);

  if (!permutas || permutas.length === 0) {
    resultadoConsulta.innerHTML =
      '<div class="mensagem-consulta">Nenhuma permuta futura encontrada para este RG.</div>';
    return;
  }

  const rgConsultado = limparRG(rgConsulta.value);

  let html = "";

  permutas.forEach((permuta) => {
    const classeStatus = obterClasseStatus(permuta.status);
    const podeCancelar = verificarPodeCancelar(permuta.podeCancelar);

    const botaoCancelar = podeCancelar
      ? `
        <button type="button" class="botao-cancelar" data-linha="${escaparHtml(permuta.linha)}">
          Solicitar Cancelamento
        </button>

        <div class="area-cancelamento" id="cancelamento-${escaparHtml(permuta.linha)}">
          <input type="email" class="email-cancelamento" placeholder="E-mail cadastrado no RG consultado">

          <button type="button" class="botao-enviar-codigo" data-linha="${escaparHtml(permuta.linha)}" data-rg-consulta="${escaparHtml(rgConsultado)}">
            Enviar Código
          </button>

          <input type="text" class="codigo-cancelamento" inputmode="numeric" maxlength="6" placeholder="Código recebido">

          <button type="button" class="botao-confirmar-cancelamento" data-linha="${escaparHtml(permuta.linha)}" data-rg-consulta="${escaparHtml(rgConsultado)}">
            Confirmar Cancelamento
          </button>

          <div class="mensagem-cancelamento"></div>
        </div>
      `
      : "";

    html += `
      <div class="card-permuta">
        <div class="data">${escaparHtml(permuta.dataServico)}</div>

        <div class="linha-permuta">
          <span class="rotulo">Entra:</span> ${escaparHtml(permuta.militarEntra)}
        </div>

        <div class="linha-permuta">
          <span class="rotulo">Sai:</span> ${escaparHtml(permuta.militarSai)}
        </div>

        <div class="status ${classeStatus}">
          ${escaparHtml(permuta.status)}
        </div>

        ${botaoCancelar}
      </div>
    `;
  });

  resultadoConsulta.innerHTML = html;
}

function verificarPodeCancelar(valor) {
  const texto = String(valor || "").trim().toUpperCase();

  return (
    valor === true ||
    texto === "TRUE" ||
    texto === "VERDADEIRO" ||
    texto === "SIM" ||
    texto === "1"
  );
}

function gerarAvisoCancelamentoIndisponivel(permuta) {
  const motivo = String(permuta.motivoBloqueioCancelamento || "").trim();

  if (!motivo) return "";

  return `
    <div class="aviso-cancelamento-indisponivel">
      Cancelamento indisponível: ${escaparHtml(motivo)}
    </div>
  `;
}

function obterClasseStatus(status) {
  const texto = String(status || "").trim().toUpperCase();

  if (texto === "FEITO") return "status-feito";
  if (texto === "CANCELADA") return "status-cancelada";

  return "status-pendente";
}

function escaparHtml(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatarDataBrasileira(dataIso) {
  const partes = String(dataIso || "").split("-");

  if (partes.length !== 3) return escaparHtml(dataIso);

  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function tentarProcessarPermuta(linha, tentativa) {
  const atraso = tentativa === 1 ? 1500 : 6000;

  setTimeout(() => {
    chamarApi("processarPermutaPendente", {
      linha: linha
    })
      .then((resultadoProcessamento) => {
        console.log("Retorno do processamento complementar:", resultadoProcessamento);

        const respostaProcessamento = resultadoProcessamento.resposta || {};

        if (respostaProcessamento.pendente && tentativa < 2) {
          console.log("Processamento ocupado. Tentando novamente...");
          tentarProcessarPermuta(linha, tentativa + 1);
        }
      })
      .catch((erro) => {
        console.log("Erro no processamento complementar:", erro.message);

        if (tentativa < 2) {
          tentarProcessarPermuta(linha, tentativa + 1);
        }
      });
  }, atraso);
}

async function solicitarCodigoCancelamento(linha, rgConsultaCancelamento) {
  const area = document.getElementById("cancelamento-" + linha);

  if (!area) return;

  const emailInput = area.querySelector(".email-cancelamento");
  const mensagemCancelamento = area.querySelector(".mensagem-cancelamento");
  const botao = area.querySelector(".botao-enviar-codigo");

  const email = emailInput.value.trim();
  const rgConsultado = limparRG(rgConsultaCancelamento || rgConsulta.value);

  mensagemCancelamento.textContent = "";
  mensagemCancelamento.className = "mensagem-cancelamento";

  if (!rgConsultado) {
    mensagemCancelamento.textContent = "RG da consulta não identificado. Atualize a consulta e tente novamente.";
    mensagemCancelamento.classList.add("erro");
    return;
  }

  if (!email) {
    mensagemCancelamento.textContent = "Informe o e-mail cadastrado para o RG consultado.";
    mensagemCancelamento.classList.add("erro");
    return;
  }

  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    const resultado = await chamarApi("solicitarCodigoCancelamentoPermuta", {
      linha: linha,
      rgConsulta: rgConsultado,
      email: email
    });

    mensagemCancelamento.textContent =
      resultado.mensagem || "Código enviado para o e-mail informado.";
    mensagemCancelamento.classList.add("sucesso");

  } catch (erro) {
    mensagemCancelamento.textContent = erro.message;
    mensagemCancelamento.classList.add("erro");

  } finally {
    botao.disabled = false;
    botao.textContent = "Enviar Código";
  }
}

async function confirmarCancelamento(linha, rgConsultaCancelamento) {
  const area = document.getElementById("cancelamento-" + linha);

  if (!area) return;

  const emailInput = area.querySelector(".email-cancelamento");
  const codigoInput = area.querySelector(".codigo-cancelamento");
  const mensagemCancelamento = area.querySelector(".mensagem-cancelamento");
  const botao = area.querySelector(".botao-confirmar-cancelamento");

  const email = emailInput.value.trim();
  const codigo = codigoInput.value.trim();
  const rgConsultado = limparRG(rgConsultaCancelamento || rgConsulta.value);

  mensagemCancelamento.textContent = "";
  mensagemCancelamento.className = "mensagem-cancelamento";

  if (!rgConsultado) {
    mensagemCancelamento.textContent = "RG da consulta não identificado. Atualize a consulta e tente novamente.";
    mensagemCancelamento.classList.add("erro");
    return;
  }

  if (!email) {
    mensagemCancelamento.textContent = "Informe o e-mail cadastrado para o RG consultado.";
    mensagemCancelamento.classList.add("erro");
    return;
  }

  if (!codigo) {
    mensagemCancelamento.textContent = "Informe o código recebido por e-mail.";
    mensagemCancelamento.classList.add("erro");
    return;
  }

  botao.disabled = true;
  botao.textContent = "Confirmando...";

  try {
    const resultado = await chamarApi("confirmarCancelamentoPermuta", {
      linha: linha,
      rgConsulta: rgConsultado,
      email: email,
      codigo: codigo
    });

    mensagemCancelamento.textContent =
      resultado.mensagem || "Cancelamento registrado com sucesso.";
    mensagemCancelamento.classList.add("sucesso");

    setTimeout(() => {
      consultarPermutasFuturas();
    }, 1200);

  } catch (erro) {
    mensagemCancelamento.textContent = erro.message;
    mensagemCancelamento.classList.add("erro");

  } finally {
    botao.disabled = false;
    botao.textContent = "Confirmar Cancelamento";
  }
}
