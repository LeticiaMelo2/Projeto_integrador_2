// ===== IMPORTS DE FUNÇÕES =====
import { calcularIdade } from "./func_paciente.js";
import * as banco from "../pasta de testes/banco_teste.js";
import { getConnection } from "../scripts_integracao/conexao_banco.js";

// ==========================================================

// ==========================================================

// ===== Variáveis de uso global =====
let contadorAtendimento = 1; // Contador para o número de atendimento - num de atendimento é uma sequencia
// ==========================================================




async function criacaoNumAtendimento(idade, etapa = "recepcao") {
    //separar entre idade preferêncial e normal
    let prefixo;

    if (etapa === "recepcao") {

        if (idade >= 60) {
            prefixo = "RP"; // Recepção Preferencial
        } else {
            prefixo = "RN"; // Recepção Normal
        }
    }
    else if (etapa === "triagem") {
        if (idade >= 60) {
            prefixo = "TP"; // Triagem Preferencial
        } else {
            prefixo = "TN"; // Triagem Normal
        }
    } else {

        throw new Error(
            "Etapa de atendimento inválida."
        );
    }

    const numero = String(contadorAtendimento).padStart(3, "0");

    contadorAtendimento++;

    return prefixo + numero;
}



function cadastrarAtendimento(idPaciente, dataNascimento) {
    const paciente = banco.buscarPacientePorId(idPaciente);

    if (!paciente) {

        throw new Error(
            `Paciente com id ${idPaciente} não encontrado.`
        );
    }

    const idade = calcularIdade(paciente.data_nasc);
    const numAtendimento = criacaoNumAtendimento(idade, "recepcao");

    // let documento;
    // if (idPaciente.tipo_doc === "RG") {
    //     documento = idPaciente.rg;
    // } else if (idPaciente.tipo_doc === "CPF") {
    //     documento = idPaciente.cpf;
    // }

    const atendimento = {
        //cpf_paciente: idPaciente.cpf_paciente,
        id_paciente: paciente.id_paciente,
        num_atendimento: numAtendimento,
        status: "AGUARDANDO_TRIAGEM",
        nome_completo: paciente.nome_completo,
        //data_nasc: dataNascimento,
        //nome_responsavel: idPaciente.nome_responsavel,
        //documento: documento,
    };

    const atendimentoCadastrado = banco.inserirAtendimento(atendimento);

    return atendimentoCadastrado;
}

export {
    cadastrarAtendimento,
    criacaoNumAtendimento
};
