// js/Registar.js
document.addEventListener("DOMContentLoaded", () => {
  // Form e elementos
  const form = document.getElementById("colaborador-form");
  const tipoSelect = document.getElementById("tipo-registo");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const dataInicio = document.getElementById("data-inicio");
  const dataFim = document.getElementById("data-fim");
  const cargoInput = document.getElementById("colab-cargo");
  const deptInput = document.getElementById("colab-dept");
  const motivoInput = document.getElementById("motivo-visita");
  const salasGroup = document.querySelector(".salas-group");
  const salaCheckboxes = Array.from(
    document.querySelectorAll("input[name='salas']")
  );
  const salasFeedback = salasGroup.querySelector(".invalid-feedback");

  // Campos dinâmicos
  const colabFields = document.querySelectorAll("[data-role='colab']");
  const visitFields = document.querySelectorAll("[data-role='visitante']");

  // Cartão de confirmação
  const card = document.getElementById("card");
  const cardNome = document.getElementById("card-nome");
  const cardEmail = document.getElementById("card-email");
  const cardTipo = document.getElementById("card-tipo");
  const cardInicio = document.getElementById("card-inicio");
  const cardFim = document.getElementById("card-fim");
  const cardCargo = document.getElementById("card-cargo");
  const cardDepto = document.getElementById("card-depto");
  const cardMotivo = document.getElementById("card-motivo");
  const cardSalasEls = document.querySelectorAll(".card-salas");

  // QR e botões
  const qrContainer = document.getElementById("qr-code");
  const btnSubmit = form.querySelector("button[type='submit']");
  const btnPrint = document.getElementById("btn-imprimir");

  const API_URL = "https://68e407d98e116898997acd06.mockapi.io/users";
  let isNewRegistration = false;

  function atualizarVisibilidade() {
    const tipo = tipoSelect.value;
    colabFields.forEach((el) => {
      const show = tipo === "colaborador";
      el.classList.toggle("d-none", !show);
      el.querySelectorAll("input").forEach((i) => (i.disabled = !show));
    });
    visitFields.forEach((el) => {
      const show = tipo === "visitante";
      el.classList.toggle("d-none", !show);
      el.querySelectorAll("textarea").forEach((i) => (i.disabled = !show));
    });
  }

  // Inicialização
  atualizarVisibilidade();
  if (!dataInicio.value) {
    dataInicio.value = new Date().toISOString().split("T")[0];
  }

  // Reset ao mudar tipo
  tipoSelect.addEventListener("change", () => {
    const sel = tipoSelect.value;
    form.reset();
    form.classList.remove("was-validated");
    salasGroup.classList.remove("is-invalid");
    salasFeedback.classList.remove("d-block");
    salaCheckboxes.forEach((cb) => cb.classList.remove("is-invalid"));
    tipoSelect.value = sel;
    isNewRegistration = false;
    btnSubmit.textContent = "Registar e Gerar Cartão";
    card.classList.add("d-none");
    qrContainer.innerHTML = "";
    atualizarVisibilidade();
    if (!dataInicio.value) {
      dataInicio.value = new Date().toISOString().split("T")[0];
    }
  });

  btnPrint.addEventListener("click", () => window.print());

  // Submit do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Novo registo: limpar tudo
    if (isNewRegistration) {
      form.reset();
      form.classList.remove("was-validated");
      salasGroup.classList.remove("is-invalid");
      salasFeedback.classList.remove("d-block");
      salaCheckboxes.forEach((cb) => cb.classList.remove("is-invalid"));
      atualizarVisibilidade();
      card.classList.add("d-none");
      qrContainer.innerHTML = "";
      btnSubmit.textContent = "Registar e Gerar Cartão";
      isNewRegistration = false;
      return;
    }

    // Validação customizada de salas
    const salasSelecionadas = salaCheckboxes
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    if (salasSelecionadas.length === 0) {
      salasGroup.classList.add("is-invalid");
      salaCheckboxes.forEach((cb) => cb.classList.add("is-invalid"));
      salasFeedback.classList.add("d-block");
      return;
    } else {
      salasGroup.classList.remove("is-invalid");
      salaCheckboxes.forEach((cb) => cb.classList.remove("is-invalid"));
      salasFeedback.classList.remove("d-block");
    }

    // Validação de datas
    dataFim.setCustomValidity("");
    if (
      dataInicio.value &&
      dataFim.value &&
      new Date(dataFim.value) < new Date(dataInicio.value)
    ) {
      dataFim.setCustomValidity(
        "Data de fim não pode ser anterior à data de início."
      );
    }

    // Validação HTML5 padrão
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Coleta de valores
    const tipoVal = tipoSelect.value;
    const nomeVal = nomeInput.value.trim();
    const emailVal = emailInput.value.trim();
    const inicioVal = dataInicio.value;
    const fimVal = dataFim.value;

    // Montagem do payload
    const payload = {
      tipo: tipoVal,
      nome: nomeVal,
      email: emailVal,
      dataInicio: inicioVal,
      dataFim: fimVal,
      status: "Activo",
      cargo: "",
      departamento: "",
      motivoVisita: "",
      salas: salasSelecionadas,
    };

    if (tipoVal === "visitante") {
      payload.motivoVisita = motivoInput.value.trim();
    } else {
      payload.cargo = cargoInput.value.trim();
      payload.departamento = deptInput.value.trim();
    }

    // Envio para API
    let novoRegistro;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro na API");
      novoRegistro = await res.json();
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao registar. Tente novamente.");
      return;
    }

    // Preenche cartão de confirmação
    cardNome.textContent = nomeVal;
    cardEmail.textContent = emailVal;
    cardTipo.textContent = tipoVal;
    cardInicio.textContent = inicioVal;
    cardFim.textContent = fimVal;

    if (tipoVal === "visitante") {
      cardMotivo.textContent = payload.motivoVisita;
      document.getElementById("visitante-card").classList.remove("d-none");
      document.getElementById("colaborador-card").classList.add("d-none");
    } else {
      cardCargo.textContent = payload.cargo;
      cardDepto.textContent = payload.departamento;
      document.getElementById("colaborador-card").classList.remove("d-none");
      document.getElementById("visitante-card").classList.add("d-none");
    }

    // Exibe salas no cartão
    cardSalasEls.forEach((el) => {
      el.textContent = salasSelecionadas.join(", ");
    });

    card.classList.remove("d-none");

    // Gera QR code com ID
    window.gerarQRCode(qrContainer, { id: novoRegistro.id });

    btnSubmit.textContent = "Novo Registo";
    isNewRegistration = true;
  });
});
