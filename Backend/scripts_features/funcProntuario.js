import { getConnection } from '../scripts_integracao/conexaoBD.js';

//funções para manipulação de prontuários

export async function consultarProntuario(id) {
    // Implementação para consultar prontuário
}

export async function alterarProntuario(id, dados) {
    // Implementação para alterar prontuário
}

export async function listarProntuarios() {
    // Implementação para listar prontuários
}

export async function consultarHistoricoProntuario(id) {
    // Implementação para consultar histórico do prontuário
}

export async function incluirProntuario(idAtendimento, dados) {
    throw new Error('Inclusão de prontuário ainda não implementada.');
}
