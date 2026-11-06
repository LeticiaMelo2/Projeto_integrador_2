import getConnection from '../scripts_integracao/conexaoBD.js';

//funções para a manipulação de atendimentos



export async function consultarAtendimento(id) {
    // Implementação para consultar atendimento
}   
export async function incluirAtendimento(dados) {
    // Implementação para incluir atendimento
}
export async function alterarAtendimento(id, dados) {
    // Implementação para alterar atendimento
}

export async function listarAtendimentos() {
    throw new Error('Listagem de atendimentos ainda não implementada.');
}

export async function consultarHistoricoAtendimento(id) {
    throw new Error('Consulta do histórico de atendimento ainda não implementada.');
}
