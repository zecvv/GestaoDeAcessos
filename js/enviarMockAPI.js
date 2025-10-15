// Enviar para a API
  async function enviarParaAPI(payload) {
    try {
      const res = await fetch(
        "https://68e407d98e116898997acd06.mockapi.io/users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error("Erro ao enviar dados para a API");
      const data = await res.json();
      console.log("Registo inserido com sucesso:", data);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao registar. Tente novamente.");
    }
  }