
import { getConnection } from '../scripts_integracao/conexaoBD.js';


//funções para o manipulação de pacientes

export async function consultarPaciente(id) {
    const conexao = await getConnection();
    try {
        const [resultado] = await conexao.execute(
            'SELECT * FROM PACIENTES WHERE id = ?', [id]
        );
        return resultado[0] ?? null;
    } finally {
        await conexao.end();
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            dados.endereco_complemento,
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
        await conexao.commit();
        return resultado.insertId;
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        await conexao.end();
    }
}


export async function alterarPaciente(id, dados, campo = null) {
    const conexao = await getConnection();
    const camposPermitidos = new Set([
        'nome_completo', 'cpf', 'rg', 'data_nascimento', 'sexo', 'nome_mae',
        'nome_pai', 'telefone', 'endereco_cep', 'endereco_logradouro',
        'endereco_numero', 'endereco_bairro', 'endereco_cidade',
        'endereco_estado', 'endereco_complemento', 'responsavel_legal_nome',
        'responsavel_legal_parentesco', 'tipo_sanguineo', 'alergias',
        'convenio_nome', 'convenio_numero', 'convenio_plano',
        'contato_emerg_nome', 'contato_emerg_parentesco', 'contato_emerg_tel'
    ]);


    try {
        // Define os campos que serão atualizados
        const alteracoes = campo
            ? { [campo]: dados[campo] }
            : dados;

        // Apenas campos permitidos
        const entradas = Object.entries(alteracoes)
            .filter(([nome]) => camposPermitidos.has(nome));

        // Verifica se existem campos inválidos 
        if (entradas.length === 0 || entradas.length !== Object.keys(alteracoes).length) {
            throw new Error('Um ou mais campos de paciente são inválidos.');
        }

        // transforma json de dados em parametros funcionais para o update
        const setClause = entradas
            .map(([nome]) => `\`${nome}\` = ?`)
            .join(', ');

        // Extrai os valores e adiciona o ID do paciente
        const valores = entradas.map(([, valor]) => valor);
        valores.push(id);

        // Executa a atualização
        const [resultado] = await conexao.execute(
            `UPDATE PACIENTES SET ${setClause} WHERE id = ?`,
            valores
        );

        // Retorna os dados atualizados
        const [paciente] = await conexao.execute(
            'SELECT * FROM PACIENTES WHERE id = ?',
            [id]
        );

        return paciente[0] ?? null;


    } finally {
        await conexao.end();
    }


}

export async function listarPacientes() {
    const conexao = await getConnection();
    // Implementação para listar pacientes

    try {
        const [resultado] = await conexao.execute('SELECT * FROM PACIENTES');
        return resultado;
    } finally {
        await conexao.end();
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
