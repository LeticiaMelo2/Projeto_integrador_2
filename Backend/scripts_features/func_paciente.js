// ===== IMPORTS DE FUNÇÕES =====
import { validarCPF } from"./scripts_features/func_cpf.js";
// ==========================================================

// ===== CHAMADA DO BANCO DE DADOS NOS ARQUIVOS DO BACK =====
/*const express = require("express");
const cors = require("cors"); // Necessário para permitir que o frontend converse com o backend
const banco_dados = require("../scripts_integracao/conexao");

const app = express();

app.use(cors());
app.use(express.json());*/
// ==========================================================

function cadastrarPacienteRecepcao(nome_input, responsavel_input, data_nasc_input, rg_input, cpf_input, nacionalidade_input, estado_civil_input, rua_input, bairro_input, cidade_input, estado_input, cep_input, telefone_input) {
    //ideia de botar email como outro meio de contato

    // Validar o CPF antes de cadastrar o paciente
    const cpfValido = validarCPF(cpf_input);
    if (!cpfValido) {
        console.log("CPF inválido!");
        return null;
    }


    let data_nasc_formatada = mascaraDataNasc(data_nasc_input);

    let paciente = {
        nome_completo: nome_input,
        nome_responsavel: responsavel_input,
        data_nasc: data_nasc_formatada,
        rg: rg_input,
        cpf: cpfValido, // Use o CPF validado
        endereco: {
            rua: rua_input,
            bairro: bairro_input,
            cidade: cidade_input,
            estado: estado_input,
            cep: cep_input,
        },
        nacionalidade: nacionalidade_input,
        estado_civil: estado_civil_input,
        telefone: telefone_input,
        //idade: calcularIdade(data_nasc_formatada),
    };

    const pacienteCadastrado = banco_dados.inserirPaciente(paciente);

    return pacienteCadastrado;

    // try {
    //     const envio_banco = await fetch("http://localhost:3000/pacientes", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(paciente), // Transforma o objeto "paciente" em texto JSON
    //     });

    //     const dados = await envio_banco.json();

    //     if (envio_banco.ok) {
    //         alert("Paciente cadastrado com sucesso!");
    //         return dados;
    //     } else {
    //         alert("Erro no cadastro: " + dados.erro);
    //     }
    // } catch (error) {
    //     console.error("Erro ao cadastrar paciente:", error);
    //     alert(
    //         "Erro ao cadastrar paciente. Verifique o console para mais detalhes.",
    //     );
    // }
}

async function mascaraDataNasc(params) {
    // Remove qualquer caractere que não seja número
    let data_formatada = params.replace(/\D/g, "");

    // Adiciona a máscara de data no formato DD/MM/AAAA
    if (data_formatada.length > 2) {
        data_formatada = data_formatada.slice(0, 2) + "/" + data_formatada.slice(2);
    }

    if (data_formatada.length > 5) {
        data_formatada = data_formatada.slice(0, 5) + "/" + data_formatada.slice(5, 9);
    }
    return data_formatada;
}

async function calcularIdade(data_nasc) {

    const [dia, mes, ano] = data_nasc.split("/").map(Number);
    const nascimento =  new Date(ano, mes - 1, dia);
    const hoje = new Date();

    //const nascimento = new Date(data_nasc);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    
    //const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (hoje.getMonth() < nascimento.getMonth() || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

export {
    cadastrarPacienteRecepcao,
    mascaraDataNasc,
    calcularIdade
};