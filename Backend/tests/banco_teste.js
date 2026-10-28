// Banco de dados em memória para testes.
//
// Simula duas tabelas:
//
// pacientes
//     id_paciente (PK)
//
// atendimentos
//     id_atendimento (PK)
//     id_paciente (FK -> pacientes.id_paciente)

const pacientes = [];
const atendimentos = [];

let proximoIdPaciente = 1;
let proximoIdAtendimento = 1;


// ==========================================================
// PACIENTES
// ==========================================================

function inserirPaciente(paciente) {

    const novoPaciente = {
        id_paciente: proximoIdPaciente++,
        ...paciente
    };

    pacientes.push(novoPaciente);

    return novoPaciente;
}


function buscarPacientePorId(idPaciente) {

    return pacientes.find(
        paciente => paciente.id_paciente === idPaciente
    );
}


// ==========================================================
// ATENDIMENTOS
// ==========================================================

function inserirAtendimento(atendimento) {

    const novoAtendimento = {
        id_atendimento: proximoIdAtendimento++,
        ...atendimento
    };

    atendimentos.push(novoAtendimento);

    return novoAtendimento;
}


function buscarAtendimentosPorPaciente(idPaciente) {

    return atendimentos.filter(
        atendimento => atendimento.id_paciente === idPaciente
    );
}


// ==========================================================
// CONSULTAS GERAIS
// ==========================================================

function listarPacientes() {
    return pacientes;
}


function listarAtendimentos() {
    return atendimentos;
}


// ==========================================================
// LIMPAR BANCO DE TESTE
// ==========================================================

function limparBancoTeste() {

    pacientes.length = 0;
    atendimentos.length = 0;

    proximoIdPaciente = 1;
    proximoIdAtendimento = 1;
}


export {
    pacientes,
    atendimentos,

    inserirPaciente,
    inserirAtendimento,

    buscarPacientePorId,
    buscarAtendimentosPorPaciente,

    listarPacientes,
    listarAtendimentos,

    limparBancoTeste
};