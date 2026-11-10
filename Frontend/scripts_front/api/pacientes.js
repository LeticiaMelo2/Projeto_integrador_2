const API_BASE_URL = window.API_BASE_URL ?? ''; //http://localhost:3000
// função de encapsulamento de leitura
function valorCampo(id) {
    const campo = document.getElementById(id);
    return campo?.value.trim() || null;
}

//payload
function montarDadosPaciente() {
    return {
        nome_completo: valorCampo('name'),
        cpf: valorCampo('cpf'),
        rg: valorCampo('rg'),
        data_nascimento: valorCampo('dataNascimento'),
        sexo: valorCampo('sexo'),
        nome_mae: valorCampo('nome-mae'),
        nome_pai: valorCampo('nome-pai'),
        telefone: valorCampo('telefone'),
        endereco_cep: valorCampo('CEP'),
        endereco_logradouro: valorCampo('Logradouro'),
        endereco_numero: valorCampo('numero'),
        endereco_complemento: null,
        endereco_bairro: valorCampo('Bairro'),
        endereco_cidade: valorCampo('cidade'),
        endereco_estado: valorCampo('uf'),
        responsavel_legal_nome: null,
        responsavel_legal_parentesco: null,
        tipo_sanguineo: null,
        alergias: null,
        convenio_nome: valorCampo('atendimento') === 'convenio' ? valorCampo('plano') : null,
        convenio_numero: null,
        convenio_plano: null,
        contato_emerg_nome: null,
        contato_emerg_parentesco: null,
        contato_emerg_tel: null
    };
}

async function requisitarPaciente(url, options = {}) {
    let resposta;
    try {
        resposta = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
    } catch {
        throw new Error('Não foi possível conectar à API de pacientes.');
    }

    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
        throw new Error(resultado.mensagem || resultado.erro || 'A API não concluiu a operação.');
    }
    return resultado;
}

async function enviarPaciente(dadosPaciente) {
    return requisitarPaciente('/pacientes', {
        method: 'POST',
        body: JSON.stringify(dadosPaciente)
    });
}

async function consultarPaciente(id) {
    return requisitarPaciente(`/pacientes/${encodeURIComponent(id)}`);
}

async function listarPacientes() {
    return requisitarPaciente('/pacientes');
}

async function alterarPaciente(id, dadosPaciente) {
    return requisitarPaciente(`/pacientes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(dadosPaciente)
    });
}

async function coletarDados(event) {
    event?.preventDefault();
    return enviarPaciente(montarDadosPaciente());
}