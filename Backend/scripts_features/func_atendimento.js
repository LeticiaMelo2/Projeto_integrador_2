// ===== IMPORTS DE FUNÇÕES =====
import { calcularIdade } from "./func_paciente.js";
import * as banco from "../pasta de testes/banco_teste.js";


// ==========================================================

// ===== CHAMADA DO BANCO DE DADOS NOS ARQUIVOS DO BACK =====
/*const express = require("express");
const cors = require("cors"); // Necessário para permitir que o frontend converse com o backend
const banco_dados = require("../scripts_integracao/conexao");

const app = express();*/
// ==========================================================

// ===== Variáveis de uso global =====
let contadorAtendimento = 1; // Contador para o número de atendimento - num de atendimento é uma sequencia
// ==========================================================

// async function cadastrarAtendimento(nome_paciente, responsavel_paciente, data_nasc_paciente, rg_paciente, cpf_paciente, tipo_doc_paciente, numAtendimento_paciente) {

//     let atendimento = {
//         nome_completo: nome_paciente,
//         nome_responsavel: responsavel_paciente,
//         data_nasc: data_nasc_paciente,
//         rg: rg_paciente,
//         cpf: cpf_paciente, // Use o CPF validado
//         tipo_doc: tipo_doc_paciente,
//         num_atendimento: await criacaoNumAtendimento(await calcularIdade(data_nasc_paciente), "recepcao"), // Adiciona o número de atendimento ao objeto paciente
//     };

//     try {
//         const envio_banco = await fetch("http://localhost:3000/pacientes", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(atendimento), // Transforma o objeto "atendimento" em texto JSON
//         });

//         const dados = await envio_banco.json();

//         if (envio_banco.ok) {
//             alert("atendimento cadastrado com sucesso!");
//             return dados;
//         } else {
//             alert("Erro no cadastro: " + dados.erro);
//         }
//     } catch (error) {
//         console.error("Erro ao cadastrar atendimento:", error);
//         alert(
//             "Erro ao cadastrar atendimento. Verifique o console para mais detalhes.",
//         );
//     }
// }


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
