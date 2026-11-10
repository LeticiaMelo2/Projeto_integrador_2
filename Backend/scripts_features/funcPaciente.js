
import { getConnection } from '../scripts_integracao/conexaoBD.js';


//funções para o manipulação de pacientes

export async function consultarPaciente(id) {
    // Implementação para consultar paciente
    try {
        await conexao.beginTransaction();
        const sqlPacienteAll = `
            SELECT * FROM PACIENTES where id = ?
        `;

        const [resultado] = await conexao.execute(sqlPacienteAll, [id]);

        await conexao.commit();
        return resultado;

    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
    }
}

export async function incluirPaciente(dados) {
    const conexao = await getConnection();
    // Implementação para incluir paciente
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
                endereco_cep,
                endereco_logradouro,
                endereco_numero,
                endereco_bairro,
                endereco_cidade,
                endereco_estado,
                endereco_complemento,
                
                responsavel_legal_nome,
                responsavel_legal_parentesco,

                tipo_sanguineo,
                alergias,
                convenio_nome,
                convenio_numero,
                convenio_plano,
                contato_emerg_nome,
                contato_emerg_parentesco,
                contato_emerg_tel
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valoresPaciente = [
            dados.nome_completo,
            dados.cpf,
            dados.rg,
            dados.data_nascimento,
            dados.sexo,
            dados.nome_mae,
            dados.nome_pai,
            dados.telefone,
            dados.endereco_cep,
            dados.endereco_logradouro,
            dados.endereco_numero,
            dados.endereco_bairro,
            dados.endereco_cidade,
            dados.endereco_estado,
            dados.responsavel_legal_nome,
            dados.responsavel_legal_parentesco,
            dados.tipo_sanguineo,
            dados.alergias,
            dados.convenio_nome,
            dados.convenio_numero,
            dados.convenio_plano,
            dados.contato_emerg_nome,
            dados.contato_emerg_parentesco,
            dados.contato_emerg_tel
        ];

        const [resultado] = await conexao.execute(sqlPaciente, valoresPaciente);
        console.log(resultado);

        await conexao.commit();
        return resultado.insertId;
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
    }
}


export async function alterarPaciente(id, dados, campo) {
    const conexao = await getConnection();
    // Implementação para alterar paciente
    try {
        await conexao.beginTransaction();
        const sqlPaciente = `
            UPDATE PACIENTES
            SET ${campo} = ?
            WHERE id = ?
        `;
        const valoresPaciente = [
            dados[campo],
            id
        ];

        const [resultado] = await conexao.execute(sqlPaciente, valoresPaciente);
        await conexao.commit();

        return resultado;

    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
    }


}

export async function listarPacientes() {
    const conexao = await getConnection();
    // Implementação para listar pacientes

    try {
        await conexao.beginTransaction();
        const sqlPacienteAll = `
            SELECT * FROM PACIENTES
        `;

        const [resultado] = await conexao.execute(sqlPacienteAll);

        await conexao.commit();
        return resultado;

    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
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