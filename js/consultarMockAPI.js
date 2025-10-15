// js/consultarMockAPI.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("consulta-form");
  const tipoSelect = document.getElementById("consulta-tipo");
  const nomeInput = document.getElementById("consulta-nome");
  const dataInput = document.getElementById("consulta-data");
  const statusSelect = document.getElementById("consulta-status");
  const tableBody = document.querySelector("#consulta-table tbody");
  const pagination = document.getElementById("pagination");
  const API_URL = "https://68e407d98e116898997acd06.mockapi.io/users";
  const pageSize = 15;

  let allData = [];
  let currentPage = 1;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    tableBody.innerHTML = "";
    pagination.innerHTML = "";

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("API retornou erro");
      let data = await res.json();

      // filtrar por tipo
      const tipoVal = tipoSelect.value;
      if (tipoVal && tipoVal !== "all") {
        data = data.filter((item) => (item.tipo ?? "") === tipoVal);
      }

      // filtrar por nome
      const nomeVal = nomeInput.value.trim().toLowerCase();
      if (nomeVal) {
        data = data.filter((item) =>
          (item.nome ?? "").toLowerCase().includes(nomeVal)
        );
      }

      // filtrar por data
      const dataVal = dataInput.value;
      if (dataVal) {
        data = data.filter(
          (item) => (item.dataInicio ?? "").split("T")[0] === dataVal
        );
      }

      // filtrar por status
      const statusVal = statusSelect.value;
      if (statusVal) {
        data = data.filter((item) => (item.status ?? "") === statusVal);
      }

      // filtrar por salas (checkboxes inline)
      const salasChecked = Array.from(
        document.querySelectorAll("input[name='salas']:checked")
      ).map((cb) => cb.value);
      if (salasChecked.length > 0) {
        data = data.filter((item) =>
          (item.salas ?? []).some((s) => salasChecked.includes(s))
        );
      }

      // ordenar por ID decrescente
      data.sort((a, b) => Number(b.id) - Number(a.id));

      if (data.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="10" class="text-center">Nenhum registo encontrado</td>
          </tr>`;
        return;
      }

      allData = data;
      currentPage = 1;
      renderTable();
      renderPagination();
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-danger">
            Erro ao carregar dados. Tente novamente.
          </td>
        </tr>`;
    }
  });

  function renderTable() {
    tableBody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const pagedData = allData.slice(start, start + pageSize);

    pagedData.forEach((item) => {
      const tr = document.createElement("tr");
      if ((item.status ?? "") === "Inactivo") {
        tr.classList.add("table-danger");
      }

      const statusCell =
        item.status === "Activo"
          ? `<button class="btn btn-sm btn-danger desativar-btn" data-id="${item.id}">
             Desativar
           </button>`
          : item.status ?? "";

      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.tipo}</td>
        <td>${item.nome}</td>
        <td>${item.email}</td>
        <td>${(item.dataInicio ?? "").split("T")[0]}</td>
        <td>${(item.dataFim ?? "").split("T")[0]}</td>
        <td>${
          item.tipo === "colaborador"
            ? item.cargo + " / " + item.departamento
            : ""
        }
        </td>
        <td>${item.tipo === "visitante" ? item.motivoVisita : ""}</td>
        <td>${statusCell}</td>
        <td>
          <button 
            class="btn btn-sm btn-outline-primary toggle-salas-btn" 
            data-id="${item.id}" 
            aria-expanded="false">
            Ver
          </button>
        </td>
      `;
      tableBody.appendChild(tr);

      const detail = document.createElement("tr");
      detail.classList.add("detail-row", "d-none");
      detail.dataset.id = item.id;
      detail.innerHTML = `
        <td colspan="10">
          ${(item.salas ?? []).join(", ")}
        </td>
      `;
      tableBody.appendChild(detail);
    });
  }

  function renderPagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(allData.length / pageSize);

    const prevLi = document.createElement("li");
    prevLi.className = `page-item${currentPage === 1 ? " disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
    prevLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderTable();
        renderPagination();
      }
    });
    pagination.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item${i === currentPage ? " active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderTable();
        renderPagination();
      });
      pagination.appendChild(li);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item${
      currentPage === totalPages ? " disabled" : ""
    }`;
    nextLi.innerHTML = `<a class="page-link" href="#">Próximo</a>`;
    nextLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        renderPagination();
      }
    });
    pagination.appendChild(nextLi);
  }

  tableBody.addEventListener("click", async (e) => {
    // desativar registro
    if (e.target.matches(".desativar-btn")) {
      const id = e.target.dataset.id;
      e.target.disabled = true;
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Inactivo" }),
        });
        if (!res.ok) throw new Error();
        allData = allData.map((item) =>
          item.id === id ? { ...item, status: "Inactivo" } : item
        );
        renderTable();
        renderPagination();
      } catch {
        alert("Erro ao desativar.");
      }
      return;
    }

    // expandir/ocultar salas
    if (e.target.matches(".toggle-salas-btn")) {
      const btn = e.target;
      const id = btn.dataset.id;
      const detailRow = tableBody.querySelector(`.detail-row[data-id="${id}"]`);
      const expanded = !detailRow.classList.toggle("d-none");
      btn.textContent = expanded ? "Ocultar" : "Ver";
      btn.setAttribute("aria-expanded", String(expanded));
    }
  });
});
