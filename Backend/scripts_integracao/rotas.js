const rotas = {
    // Rotas de páginas (Front-end)
    "GET /": { tipo: "arquivo", caminho: "Frontend/src/index.html" },
    "GET /cadastro": { tipo: "arquivo", caminho: "Frontend/src/cadastro.html" },

    // Rotas de API (Back-end / Funções)
    "POST /cadastrar-paciente": { tipo: "funcao", acao: enviarPaciente }
};