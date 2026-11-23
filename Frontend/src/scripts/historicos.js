const URL_API = 'http://localhost:3000';

// Calcula a idade do paciente a partir da data de nascimento
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return '-';

    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diferencaMes = hoje.getMonth() - nascimento.getMonth();

    if (diferencaMes < 0 || (diferencaMes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    return `${idade} anos`;
}

// Carrega a lista de pacientes, com ou sem filtro de CPF
async function carregarPacientesHistorico() {
    const cpf = document.getElementById('buscaCpf').value;
    const tbody = document.getElementById('tabelaHistoricoPacientes');

    try {
        const response = await fetch(`http://localhost:3000/api/historico/pacientes?cpf=${encodeURIComponent(cpf)}`);
        const pacientes = await response.json();

        if (!response.ok) {
            throw new Error(pacientes.erro || 'Erro ao buscar pacientes.');
        }

        if (pacientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="texto-centralizado texto-suave">
                        Nenhum paciente encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pacientes.map(paciente => `
            <tr>
                <td>${paciente.nome}</td>
                <td>${paciente.cpf}</td>
                <td>${calcularIdade(paciente.data_nascimento)}</td>
                <td>
                    <button type="button" class="botao botao-pequeno botao-primario" onclick="abrirHistorico(${paciente.id})">
                        Detalhes
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        console.error('Erro ao carregar histórico:', erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="texto-centralizado texto-perigo">
                    ${erro.message}
                </td>
            </tr>
        `;
    }
}

// Preenche os dois containers do modal e torna o modal visível
async function abrirHistorico(idPaciente) {
    try {
        const response = await fetch(`http://localhost:3000/api/historico/pacientes/${idPaciente}`);
        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || 'Erro ao carregar histórico.');
        }

        preencherDetalhesPaciente(dados.paciente);
        preencherAtendimentosPaciente(dados.atendimentos);

        const modal = document.getElementById('modalHistorico');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    } catch (erro) {
        console.error('Erro ao abrir histórico:', erro);
        alert(erro.message);
    }
}

function preencherDetalhesPaciente(paciente) {
    const dataNascimento = paciente.data_nascimento
        ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')
        : '-';
    const endereco = [paciente.logradouro, paciente.numero, paciente.bairro, paciente.cidade, paciente.uf]
        .filter(Boolean)
        .join(', ');
    const dataCadastro = paciente.data_cadastro
        ? new Date(paciente.data_cadastro).toLocaleString('pt-BR')
        : '';

    function preencherCampo(seletor, valor) {
        const campo = document.querySelector(seletor);
        const container = campo.closest('.campo-detalhe-paciente');
        campo.textContent = valor ? valor : '';
        container.style.display = valor ? 'block' : 'none';
    }

    document.querySelector('.nome-paciente-historico').textContent = paciente.nome || '-';
    preencherCampo('.cpf-paciente-historico', paciente.cpf);
    preencherCampo('.data-nascimento-paciente-historico', paciente.data_nascimento ? dataNascimento : '');
    preencherCampo('.idade-paciente-historico', paciente.data_nascimento ? calcularIdade(paciente.data_nascimento) : '');
    preencherCampo('.rg-paciente-historico', paciente.rg);
    preencherCampo('.nome-mae-paciente-historico', paciente.nome_mae);
    preencherCampo('.telefone-paciente-historico', paciente.telefone);
    preencherCampo('.email-paciente-historico', paciente.email);
    preencherCampo('.endereco-paciente-historico', endereco);
    preencherCampo('.alergias-paciente-historico', paciente.alergias);
    preencherCampo('.nome-pai-paciente-historico', paciente.nome_pai);
    preencherCampo('.sexo-paciente-historico', paciente.sexo);
    preencherCampo('.cep-paciente-historico', paciente.cep);
    preencherCampo('.tipo-atendimento-paciente-historico', paciente.tipo_atendimento_nome ? paciente.tipo_atendimento_nome : paciente.tipo_atendimento_id);
    preencherCampo('.convenio-paciente-historico', paciente.convenio_nome ? paciente.convenio_nome : paciente.convenio_id);
    preencherCampo('.tipo-sanguineo-paciente-historico', paciente.tipo_sanguineo);
    preencherCampo('.data-cadastro-paciente-historico', dataCadastro);
}

function preencherAtendimentosPaciente(atendimentos) {
    const tbody = document.getElementById('tabelaAtendimentosPaciente');

    if (atendimentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="texto-centralizado texto-suave">
                    Nenhum atendimento registrado.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = atendimentos.map(atendimento => `
        <tr>
            <td class="small">#${atendimento.numero_atendimento}</td>
            <td class="medium">${atendimento.criado_em ? new Date(atendimento.criado_em).toLocaleString('pt-BR') : '-'}</td>
            <td class="small">${atendimento.situacao_nome || '-'}</td>
            <td class="small">${atendimento.classificacao_risco || '-'}</td>
            <td class="medium">${atendimento.diagnostico ? atendimento.diagnostico : ''}</td>
            <td class="large">${atendimento.principais_queixas ? atendimento.principais_queixas : ''}</td>
            <td class="large">
                <div class="sinais_vitais">
                    ${atendimento.pressao_arterial || atendimento.temp_corporal || atendimento.batimentos_cardiacos? 
                    `<p><b>PA: </b> ${atendimento.pressao_arterial ? atendimento.pressao_arterial : '-'} </p>
                    <p><b>Temp. :</b> ${atendimento.temp_corporal ? atendimento.temp_corporal + ' °C' : '-'}</p>
                    <p><b>BPM:</b> ${atendimento.batimentos_cardiacos ? atendimento.batimentos_cardiacos : '-'}</p>`
                : ''}
                </div>
            </td>
            <td class="medium">${atendimento.medico_nome ? atendimento.medico_nome : ''}</td>
            <td class="large">${atendimento.prescricao ? atendimento.prescricao : ''}</td>
            <td class="large">${atendimento.observacoes_consulta || atendimento.observacoes_triagem
                ? (atendimento.observacoes_consulta ? atendimento.observacoes_consulta : atendimento.observacoes_triagem)
                : ''}</td>
        </tr>
    `).join('');
}

function fecharHistorico() {
    const modal = document.getElementById('modalHistorico');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPacientesHistorico();

    document.getElementById('btnBuscarHistorico').addEventListener('click', carregarPacientesHistorico);
    document.getElementById('fecharHistorico').addEventListener('click', fecharHistorico);
    document.getElementById('buscaCpf').addEventListener('keydown', event => {
        if (event.key === 'Enter') carregarPacientesHistorico();
    });
});
