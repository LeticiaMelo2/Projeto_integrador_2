// ===== IMPORTS DE FUNÇÕES =====
import { validarCPF } from "./func_cpf.js";
import * as banco from "../pasta de testes/banco_teste.js";
// ==========================================================

// ===== CHAMADA DO BANCO DE DADOS NOS ARQUIVOS DO BACK =====

import db from "../scripts_integracao/conexao_banco.js";
// import { payloadPaciente } from "./func_paciente-2.js";

// ==========================================================

async function enviarPaciente(payloadPaciente) {
  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();
    const sqlPaciente = `
    INSERT INTO PACIENTES (
        nome_completo,
        cpf,
        rg,
        data_nascimento,
        sexo,
        nome_mae,
        nome_pai,
        telefone,
        tipo_sanguineo,
        alergias,
        convenio_nome,
        convenio_numero,
        convenio_plano,
        contato_emerg_nome,
        contato_emerg_parentesco,
        contato_emerg_tel,
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valoresPaciente = [
      payloadPaciente.nome_completo,
      payloadPaciente.cpf,
      payloadPaciente.rg,
      mascaraDataNasc(payloadPaciente.data_nascimento),
      payloadPaciente.sexo,
      payloadPaciente.nome_mae,
      payloadPaciente.nome_pai,
      payloadPaciente.telefone,
      payloadPaciente.tipo_sanguineo,
      payloadPaciente.alergias,
      payloadPaciente.convenio_nome,
      payloadPaciente.convenio_numero,
      payloadPaciente.convenio_plano,
      payloadPaciente.contato_emerg_nome,
      payloadPaciente.contato_emerg_parentesco,
      payloadPaciente.contato_emerg_tel,
    ];

    const [resultado] = await db.execute(sql, valoresPaciente);
    console.log(resultado);
    /*
      // const idPaciente = resultadoPaciente.insertId;

      // const sqlEndereco = `
      //   INSERT INTO ENDERECOS_PACIENTES (
      //     id_fk_paciente,
      //     endereco_logradouro,
      //     endereco_numero,
      //     endereco_bairro,
      //     endereco_cep,
      //     endereco_cidade,
      //     endereco_estado
      //   ) VALUES (?, ?, ?, ?, ?, ?, ?)
      // `;

      // const endereco = payloadPaciente.endereco;

      // const valoresEndereco = [
      //   idPaciente,
      //   endereco.endereco_logradouro,
      //   endereco.endereco_numero,
      //   endereco.endereco_bairro,
      //   endereco.endereco_cep,
      //   endereco.endereco_cidade,
      //   endereco.endereco_estado,
      // ];

      // await conexao.execute(sqlEndereco, valoresEndereco);
    */
    // Confirma as duas inserções
    await conexao.commit();
  } catch (erro) {
    console.error("Erro ao enviar os dados:", erro);
  }
}

function mascaraDataNasc(params) {
  // Remove qualquer caractere que não seja número
  let data_formatada = params.replace(/\D/g, "");

  // Adiciona a máscara de data no formato DD/MM/AAAA
  if (data_formatada.length > 2) {
    data_formatada = data_formatada.slice(0, 2) + "/" + data_formatada.slice(2);
  }

  if (data_formatada.length > 5) {
    data_formatada =
      data_formatada.slice(0, 5) + "/" + data_formatada.slice(5, 9);
  }
  return data_formatada;
}

function calcularIdade(data_nasc) {
  const [dia, mes, ano] = data_nasc.split("/").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  //const nascimento = new Date(data_nasc);

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  //const mes = hoje.getMonth() - nascimento.getMonth();

  if (
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }
  return idade;
}

export { enviarPaciente, mascaraDataNasc, calcularIdade };
