// ===== IMPORTS DE FUNÇÕES =====
const { validarCPF } = require("./func_cpf.js");

// ===== CHAMADA DO BANCO DE DADOS NOS ARQUIVOS DO BACK =====
const express = require("express");
const cors = require("cors"); // Necessário para permitir que o frontend converse com o backend
const banco_dados = require("../scripts_integracao/conexao");

const app = express();

app.use(cors());
app.use(express.json());

async function cadastrarPacienteRecepcao(nome_input, responsavel_input, data_nasc_input, rg_input, cpf_input, tipo_doc_input) {
  // Validar o CPF antes de cadastrar o paciente
  const cpfValido = validarCPF(cpf_input);
  if (!cpfValido) {
    console.log("CPF inválido!");
    return;
  }

  let paciente = {
    nome_completo: nome_input,
    nome_responsavel: responsavel_input,
    data_nasc: data_nasc_input,
    rg: rg_input,
    cpf: cpfValido, // Use o CPF validado
    tipo_doc: tipo_doc_input,
  };

  try {
    const envio_banco = await fetch("http://localhost:3000/pacientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paciente), // Transforma o objeto "paciente" em texto JSON
    });

    const dados = await envio_banco.json();

    if (envio_banco.ok) {
      alert("Paciente cadastrado com sucesso!");
      return dados;
    } else {
      alert("Erro no cadastro: " + dados.erro);
    }
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    alert(
      "Erro ao cadastrar paciente. Verifique o console para mais detalhes.",
    );
  }
}

async function mascaraDataNasc(params) {}

async function calcularIdade(data_nasc) {
  const hoje = new Date();
  const nascimento = new Date(data_nasc);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}



async function criacaoNumAtendimento(idade) {}
