import { getConnection } from '../scripts_integracao/conexaoBD.js';

//funções para a manipulação de atendimentos



export async function consultarAtendimento(id) {
    const conexao = await getConnection();
    try {
        const [resultado] = await conexao.execute(
            'SELECT * FROM ATENDIMENTOS WHERE id_atendimento = ?', [id]);
        return resultado[0] ?? null;
    } finally {
        await conexao.end();
    }
}

export async function incluirAtendimento(dados) {
    const conexao = await getConnection();
    // Implementação para incluir paciente
    try {
        await conexao.beginTransaction();
        const sqlAtendimento = `
            INSERT INTO ATENDIMENTOS (
                id_atendimento,
                id_paciente,
                id_funcionario_medico ,
                status_atendimento,
                confirmacao_atendimento,
                data_inicio,
                data_fim,
                diagnostico_cid,
                observacoes,
                observacoes_alteracao,

            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valoresAtendimento = [
            dados.id_atendimento,
            dados.id_paciente,
            dados.id_funcionario_medico,
            dados.status_atendimento,
            dados.confirmacao_atendimento,
            dados.data_inicio,
            dados.data_fim,
            dados.diagnostico_cid,
            dados.observacoes,
            dados.observacoes_alteracao,
        ];

        const [resultado] = await conexao.execute(sqlAtendimento, valoresAtendimento);
        await conexao.commit();
        return resultado.insertId;
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        await conexao.end();
    }
}

export async function alterarAtendimento(id, dados) {
    const conexao = await getConnection();
    // Implementação update alterarAtendimento
    try {
        await conexao.beginTransaction();
        const sqlAlterarAtendimento = `
             UPDATE ATENDIMENTOS
            SET status_atendimento = ?
            WHERE id_atendimento = ?`
        ;

        const valoresAtendimento = [
            dados.status_atendimento,
            id
        ];

        const [resultado] = await conexao.execute(sqlAlterarAtendimento, valoresAtendimento);
        await conexao.commit();
        return resultado.insertId;
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        await conexao.end();
    }
}

export async function listarAtendimentos() {
    const conexao = await getConnection();

    try {
        const sqlAtendimento = `
            SELECT * FROM ATENDIMENTOS
        `;

        const [resultado] = await conexao.execute(sqlAtendimento);

        return resultado;

    } catch (error) {
        throw error;

    } finally {
        await conexao.end();
    }
}
