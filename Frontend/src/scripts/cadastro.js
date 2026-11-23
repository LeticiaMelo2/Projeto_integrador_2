// Exibição do campo de Convênio Médico
function verificarAtendimento() {
    const tipoAtendimento = document.getElementById('atendimento').value;
    const grupoConvenio = document.getElementById('grupo-convenio');

    if (tipoAtendimento === '3') {
        grupoConvenio.style.display = 'block';
    } else {
        grupoConvenio.style.display = 'none';
        document.getElementById('plano').value = '';
    }
}

// Avança para a etapa 2 do cadastro
function proximaEtapa() {
    const form1 = document.getElementById('form1');
    const camposObrigatorios = form1.querySelectorAll('input[required], select[required]');
    let camposValidos = true;

    camposObrigatorios.forEach(campo => {
        if (!campo.checkValidity()) {
            campo.reportValidity();
            camposValidos = false;
        }
    });

    if (!camposValidos) return;

    document.getElementById('form1').style.display = 'none';
    document.getElementById('form2').style.display = 'block';
    document.getElementById('step-1-indicator').classList.remove('etapa-ativa');
    document.getElementById('step-2-indicator').classList.add('etapa-ativa');
}

// Retorna para a etapa 1 do cadastro
function etapaAnterior() {
    document.getElementById('form2').style.display = 'none';
    document.getElementById('form1').style.display = 'block';
    document.getElementById('step-2-indicator').classList.remove('etapa-ativa');
    document.getElementById('step-1-indicator').classList.add('etapa-ativa');
}

// Envia o formulário de cadastro para o backend
document.getElementById('formCadastro').addEventListener('submit', async function(event) {
    event.preventDefault();

    const pacienteData = {
        nome: document.getElementById('name').value,
        data_nascimento: document.getElementById('dataNascimento').value,
        rg: document.getElementById('rg').value,
        cpf: document.getElementById('cpf').value,
        nome_mae: document.getElementById('nome-mae').value,
        nome_pai: document.getElementById('nome-pai').value || null,
        sexo: document.getElementById('sexo').value,
        cep: document.getElementById('CEP').value,
        logradouro: document.getElementById('Logradouro').value,
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('Bairro').value,
        cidade: document.getElementById('cidade').value,
        uf: document.getElementById('uf').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value || null,
        tipo_atendimento_id: document.getElementById('atendimento').value,
        convenio_id: document.getElementById('plano').value || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/pacientes/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pacienteData)
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || dados.mensagem || 'Verifique os dados informados.');
        }

        alert(`Paciente registrado com sucesso!\nNúmero de Atendimento: #${dados.numero_atendimento}`);
        event.target.reset();
        etapaAnterior();
        carregarPacientesCadastrados();
    } catch (erro) {
        console.error('Erro ao cadastrar paciente:', erro);
        alert(erro.message || 'Não foi possível conectar ao servidor.');
    }
});

// Busca todos os pacientes cadastrados no sistema
async function carregarPacientesCadastrados() {
    const tbody = document.getElementById('tabelaPacientesBody');

    try {
        const response = await fetch('http://localhost:3000/api/pacientes/cadastrados');

        if (!response.ok) {
            throw new Error('Falha ao buscar pacientes.');
        }

        const pacientes = await response.json();

        if (pacientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="texto-centralizado texto-suave">
                        Nenhum paciente cadastrado.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pacientes.map(paciente => `
            <tr>
                <td><strong>${paciente.numero_atendimento ? `#${paciente.numero_atendimento}` : '-'}</strong></td>
                <td>${paciente.paciente_nome}</td>
                <td><span class="badge badge-warning">${paciente.situacao_nome}</span></td>
                <td>
                    <button class="botao-icone" title="Editar" onclick="editarPaciente(${paciente.paciente_id}, ${paciente.numero_atendimento || 'null'})">
                        <i class="bx bx-edit-alt"></i>
                    </button>
                    <button class="botao-icone" title="Ver detalhes" onclick="verDetalhes(${paciente.numero_atendimento})">
                        <i class="bx bx-show"></i>
                    </button>
                    <button class="botao-icone" title="Cancelar" onclick="cancelarAtendimento(${paciente.numero_atendimento})">
                        <i class="bx bx-x"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        console.error('Erro ao preencher tabela:', erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="texto-centralizado texto-perigo">
                    Erro ao carregar a lista.
                </td>
            </tr>
        `;
    }
}

let pacienteEmEdicao = null;
let atendimentoEmEdicao = null;

// Busca os dados e abre o modal de edição
async function editarPaciente(idPaciente, numeroAtendimento) {
    try {
        const response = await fetch(`http://localhost:3000/api/historico/pacientes/${idPaciente}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar dados para edição.');
        }

        const dados = await response.json();
        const paciente = dados.paciente;
        pacienteEmEdicao = idPaciente;
        atendimentoEmEdicao = numeroAtendimento;

        document.getElementById('edit-nome').value = paciente.nome || '';
        document.getElementById('edit-data-nascimento').value = paciente.data_nascimento ? paciente.data_nascimento.split('T')[0] : '';
        document.getElementById('edit-rg').value = paciente.rg || '';
        document.getElementById('edit-cpf').value = paciente.cpf || '';
        document.getElementById('edit-nome-mae').value = paciente.nome_mae || '';
        document.getElementById('edit-nome-pai').value = paciente.nome_pai || '';
        document.getElementById('edit-sexo').value = paciente.sexo || '';
        document.getElementById('edit-telefone').value = paciente.telefone || '';
        document.getElementById('edit-email').value = paciente.email || '';
        document.getElementById('edit-cep').value = paciente.cep || '';
        document.getElementById('edit-logradouro').value = paciente.logradouro || '';
        document.getElementById('edit-numero').value = paciente.numero || '';
        document.getElementById('edit-bairro').value = paciente.bairro || '';
        document.getElementById('edit-cidade').value = paciente.cidade || '';
        document.getElementById('edit-uf').value = paciente.uf || '';
        document.getElementById('edit-tipo-atendimento').value = paciente.tipo_atendimento_id || '';
        document.getElementById('edit-convenio').value = paciente.convenio_id || '';
        document.getElementById('edit-tipo-sanguineo').value = paciente.tipo_sanguineo || '';
        document.getElementById('edit-alergias').value = paciente.alergias || '';

        const modal = document.getElementById('modalEdicaoPaciente');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    } catch (erro) {
        console.error('Erro ao carregar paciente para edição:', erro);
        alert(erro.message);
    }
}

function fecharModalEdicao() {
    const modal = document.getElementById('modalEdicaoPaciente');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    pacienteEmEdicao = null;
    atendimentoEmEdicao = null;
}

// Salva as alterações realizadas no modal
document.getElementById('formEdicaoPaciente').addEventListener('submit', async function(event) {
    event.preventDefault();

    if (!pacienteEmEdicao) return;

    const dadosPaciente = {
        nome: document.getElementById('edit-nome').value,
        data_nascimento: document.getElementById('edit-data-nascimento').value,
        rg: document.getElementById('edit-rg').value,
        cpf: document.getElementById('edit-cpf').value,
        nome_mae: document.getElementById('edit-nome-mae').value,
        nome_pai: document.getElementById('edit-nome-pai').value || null,
        sexo: document.getElementById('edit-sexo').value,
        cep: document.getElementById('edit-cep').value,
        logradouro: document.getElementById('edit-logradouro').value,
        numero: document.getElementById('edit-numero').value,
        bairro: document.getElementById('edit-bairro').value,
        cidade: document.getElementById('edit-cidade').value,
        uf: document.getElementById('edit-uf').value.toUpperCase(),
        telefone: document.getElementById('edit-telefone').value,
        email: document.getElementById('edit-email').value || null,
        tipo_atendimento_id: document.getElementById('edit-tipo-atendimento').value,
        convenio_id: document.getElementById('edit-convenio').value || null,
        tipo_sanguineo: document.getElementById('edit-tipo-sanguineo').value || null,
        alergias: document.getElementById('edit-alergias').value || null
    };

    try {
        let response = await fetch(`http://localhost:3000/api/pacientes/cadastro/${pacienteEmEdicao}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPaciente)
        });

        // Compatibilidade com o backend antigo que ainda utiliza o número do atendimento.
        if (response.status === 404 && atendimentoEmEdicao) {
            response = await fetch(`http://localhost:3000/api/pacientes/${atendimentoEmEdicao}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPaciente)
            });
        }

        const textoResposta = await response.text();
        let dados = {};

        try {
            dados = textoResposta ? JSON.parse(textoResposta) : {};
        } catch (erroConversao) {
            throw new Error(`O backend retornou uma resposta inválida (HTTP ${response.status}). Reinicie o servidor.`);
        }

        if (!response.ok) {
            throw new Error(dados.erro || 'Erro ao atualizar paciente.');
        }

        alert('Paciente atualizado com sucesso.');
        fecharModalEdicao();
        carregarPacientesCadastrados();
    } catch (erro) {
        console.error('Erro ao editar paciente:', erro);
        alert(erro.message);
    }
});

// Exibe os detalhes básicos do atendimento selecionado
async function verDetalhes(numeroAtendimento) {
    try {
        const response = await fetch(`http://localhost:3000/api/pacientes/${numeroAtendimento}`);
        const paciente = await response.json();

        if (!response.ok) {
            throw new Error(paciente.erro || 'Erro ao buscar detalhes.');
        }

        alert(
            `Atendimento: #${paciente.numero_atendimento}\n` +
            `Nome: ${paciente.nome}\n` +
            `CPF: ${paciente.cpf}\n` +
            `Telefone: ${paciente.telefone || 'Não informado'}\n` +
            `Alergias: ${paciente.alergias || 'Nenhuma'}`
        );
    } catch (erro) {
        alert(erro.message);
    }
}

// Cancela o atendimento atual
async function cancelarAtendimento(numeroAtendimento) {
    const confirmar = confirm(`Deseja realmente cancelar o atendimento #${numeroAtendimento}?`);
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/pacientes/${numeroAtendimento}/cancelar`, {
            method: 'PATCH'
        });
        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.erro || 'Falha ao cancelar atendimento.');
        }

        alert(dados.mensagem || 'Atendimento cancelado com sucesso!');
        carregarPacientesCadastrados();
    } catch (erro) {
        alert(erro.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarPacientesCadastrados();
});
