async function carregarIndicadoresTriagem() {
    try {
        const response = await fetch('http://localhost:3000/api/triagem/indicadores');
        if (!response.ok) throw new Error('Erro ao buscar indicadores.');

        const dados = await response.json();

        document.getElementById('contadorAguardando').textContent = dados.aguardando_triagem;
        document.getElementById('contadorAtendidos').textContent = dados.atendidos_hoje;

    } catch (erro) {
        console.error('Erro ao carregar contadores:', erro);
    }
}

// Atualiza tanto a lista quanto os contadores ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    carregarPainelTriagem();
    carregarIndicadoresTriagem();
});

async function carregarPainelTriagem() {
    const tbody = document.getElementById('lista-pacientes');

    try {
        const response = await fetch('http://localhost:3000/api/pacientes/situacao/1');
        if (!response.ok) throw new Error('Falha ao buscar fila de triagem.');

        const pacientes = await response.json();

        if (pacientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #777;">
                        Nenhum paciente na fila de triagem.
                    </td>
                </tr>
            `;
            return;
        }
            tbody.innerHTML = pacientes.map(paciente => `
            <tr>
                <td><strong>#${paciente.numero_atendimento}</strong></td>
                <td>${paciente.paciente_nome}</td>
                <td class="coluna-acao-painel">
                    <button class="btn-chamar-paciente" onclick="iniciarAtendimento(${paciente.numero_atendimento})">
                        Atender
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (erro) {
        console.error('Erro ao carregar painel:', erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: red;">
                    Erro ao carregar a fila de pacientes.
                </td>
            </tr>
        `;
    }
}

async function iniciarAtendimento(numeroAtendimento) {
    try {
        // muda a situacao_id para 2 no banco de dados
        const response = await fetch(`http://localhost:3000/api/atendimentos/${numeroAtendimento}/iniciar-triagem`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Não foi possível iniciar o atendimento.');

        // redireciona para a tela de triagem levando o número do atendimento na URL
        window.location.href = `triagem.html?atendimento=${numeroAtendimento}`;

    } catch (erro) {
        console.error('Erro ao atender paciente:', erro);
        alert('Erro ao iniciar a triagem do paciente.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPainelTriagem();
});