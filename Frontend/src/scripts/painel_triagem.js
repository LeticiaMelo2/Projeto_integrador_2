
// Armazena todos os pacientes recebidos do back-end.
let pacientes = [];

// Inicialização do painel.
document.addEventListener('DOMContentLoaded', () => {
    carregarPainelTriagem();
});


// Indicadores do painel.
async function carregarIndicadoresTriagem() {
    try {
        const response = await fetch(
            'http://localhost:3000/api/triagem/indicadores'
        );

        if (!response.ok) {
            throw new Error('Erro ao buscar indicadores.');
        }

        const dados = await response.json();

        document.getElementById('contadorAguardando').textContent =
            dados.aguardando_triagem;

        document.getElementById('contadorAtendidos').textContent =
            dados.atendidos_hoje;

    } catch (erro) {
        console.error('Erro ao carregar contadores:', erro);
    }
}


// Busca os pacientes apenas uma vez.
async function carregarPainelTriagem() {
    const tbody = document.getElementById('lista-pacientes');

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Carregando pacientes...
                </td>
            </tr>
        `;

        const response = await fetch(
            'http://localhost:3000/api/atendimentos/painel'
        );

        if (!response.ok) {
            throw new Error('Falha ao buscar fila de triagem.');
        }

        // Guarda o retorno completo.
        pacientes = await response.json();

        // Renderiza respeitando os filtros atuais.
        renderizarPacientes(pacientes);

    } catch (erro) {
        console.error('Erro ao carregar painel:', erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; color:red;">
                    Erro ao carregar a fila de pacientes.
                </td>
            </tr>
        `;
    }
}


// Aplica os filtros localmente.
function aplicarFiltros() {

    const status = document.getElementById('filtroStatus').value;
    const medico = document.getElementById('filtroMedico').value;
    const prioridade = document.getElementById('filtroPrioridade').value;
    const data = document.getElementById('filtroData').value;

    const pacientesFiltrados = pacientes.filter(paciente => {

        // Ajustar os nomes das propriedades conforme o JSON da API.
        const correspondeStatus =
            !status || paciente.status === status;

        const correspondeMedico =
            !medico || String(paciente.medico_id) === medico;

        const correspondePrioridade =
            !prioridade || paciente.prioridade === prioridade;

        // Considera somente a parte da data, ignorando o horário.
        const dataPaciente = paciente.data_atendimento
            ? String(paciente.data_atendimento).substring(0, 10)
            : '';

        const correspondeData =
            !data || dataPaciente === data;

        return (
            correspondeStatus &&
            correspondeMedico &&
            correspondePrioridade &&
            correspondeData
        );
    });

    renderizarPacientes(pacientesFiltrados);
}


// Renderiza a tabela.
function renderizarPacientes(lista) {

    const tbody = document.getElementById('lista-pacientes');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center; color:#777;">
                    Nenhum paciente encontrado com os filtros selecionados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(paciente => `
        <tr>
            <td>
                <strong>#${paciente.numero_atendimento}</strong>
            </td>

            <td>${paciente.paciente_nome}</td>

            <td>
                <span class="badge badge-status">
                    ${paciente.situacao_nome || 'Sem situação'}
                </span>
            </td>

            <td>${paciente.classificacao_risco || 'Aguardando triagem'}</td>

            <td class="coluna-acao-painel">
                ${paciente.situacao_id === 1
                    ? `<button class="btn-chamar-paciente" onclick="iniciarAtendimento(${paciente.numero_atendimento})">
                            Atender
                       </button>`
                    : '<span class="texto-suave">Em andamento</span>'}
            </td>
        </tr>
    `).join('');
}


// Limpa todos os filtros e recupera a listagem completa.
function limparFiltros() {

    document.querySelectorAll(
        '.filtros_painel select, .filtros_painel input'
    ).forEach(filtro => {
        filtro.value = '';
    });

    aplicarFiltros();
}


// Inicia o atendimento.
async function iniciarAtendimento(numeroAtendimento) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/atendimentos/${numeroAtendimento}/iniciar-triagem`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Não foi possível iniciar o atendimento.');
        }

        window.location.href =
            `triagem.html?atendimento=${numeroAtendimento}`;

    } catch (erro) {
        console.error('Erro ao atender paciente:', erro);
        alert('Erro ao iniciar a triagem do paciente.');
    }
}
