import 'dotenv/config';
import express from 'express';
import { getConnection } from '../scripts_integracao/conexao.js';
import { validarCPF } from './func_cpf.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor rodando com sucesso!');
});

// GET POR ID
app.get("/pacientes/:id", async (req, res) => {

    let connection;
    try {
        connection = await getConnection();
        const sql = 'select * from PACIENTES where id_paciente = ?';

        const [result] = await connection.execute(sql, [req.params.id]);

        return res.status(200).json({
            paciente:result
        });

    } catch (error){
            console.error('Erro ao consultar paciente:', error);

        return res.status(500).json({
            erro: 'Erro interno ao consultar paciente.'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

//POST PARA CADASTRAR PACIENTE
app.post('/pacientes', async (req, res) => {
    let connection;

    try {
        const {
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
            endereco_logradouro,
            endereco_numero,
            endereco_bairro,
            endereco_cep,
            endereco_cidade,
            endereco_estado,
            convenio_nome,
            convenio_numero,
            convenio_plano,
            contato_emerg_nome,
            contato_emerg_parentesco,
            contato_emerg_tel
        } = req.body;

        if (!nome_completo || !cpf || !rg) {
            return res.status(400).json({
                erro: 'Nome completo, CPF e RG são obrigatórios.'
            });
        }

        // if (!validarCPF(cpf)) {
        //     return res.status(400).json({
        //         erro: 'CPF inválido.'
        //     });
        // }

        const sql = `
            INSERT INTO PACIENTES (
                nome_completo, cpf, rg, data_nascimento, sexo,
                nome_mae, nome_pai, telefone, tipo_sanguineo, alergias,
                endereco_logradouro, endereco_numero, endereco_bairro,
                endereco_cep, endereco_cidade, endereco_estado,
                convenio_nome, convenio_numero, convenio_plano,
                contato_emerg_nome, contato_emerg_parentesco,
                contato_emerg_tel
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const valores = [
            nome_completo,
            cpf,
            rg,
            data_nascimento || null,
            sexo || null,
            nome_mae || null,
            nome_pai || null,
            telefone || null,
            tipo_sanguineo || null,
            alergias || null,
            endereco_logradouro || null,
            endereco_numero || null,
            endereco_bairro || null,
            endereco_cep || null,
            endereco_cidade || null,
            endereco_estado || null,
            convenio_nome || null,
            convenio_numero || null,
            convenio_plano || null,
            contato_emerg_nome || null,
            contato_emerg_parentesco || null,
            contato_emerg_tel || null
        ];

        connection = await getConnection();

        const [result] = await connection.execute(sql, valores);

        return res.status(201).json({
            mensagem: 'Paciente cadastrado com sucesso!',
            id_paciente: result.insertId
        });

    } catch (error) {
        console.error('Erro ao cadastrar paciente:', error);

        return res.status(500).json({
            erro: 'Erro interno ao cadastrar paciente.'
        });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});