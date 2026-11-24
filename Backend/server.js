//o Express é uma biblioteca que transforma o Node.js em um servidor de internet. cria rotas(Ele é quem escuta as requisições que chegam do navegador, lê os dados enviados pelo formulário e devolve a resposta final.)
//Cross, Esta biblioteca serve para liberar a segurança do navegador, permitindo que a sua página HTML (frontend) consiga fazer requisições e conversar com este servidor Node.js (backend) sem ser bloqueada.

//importação das bibliotecas (ferramentas) necessárias
const express = require('express');
const cors = require('cors');
//importa o driver do MySQL habilitado para trabalhar de forma assíncrona com async/await (Promises)
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

//libera requisições de origens/portas diferentes no navegador 
app.use(cors());
//converte automaticamente o corpo das requisições em formato JSON para objetos JavaScript (req.body)
app.use(express.json());

//conexão com o Banco de Dados MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'triagem_mais',
    port: Number(process.env.DB_PORT) || 3306
});

//=================================
//         ROTA LOGIN
//=================================

// Define a rota HTTP do tipo POST no endereço '/api/login'
app.post('/api/login', async (req, res) => {
// Pega o e-mail e a senha que vieram do formulário do frontend
const { email, senha } = req.body;

if (!email || !senha) {
        return res.status(400).json({ erro: 'Informe o e-mail e a senha.' });
    }
// Busca no MySQL as linhas que coincidem com o e-mail e a senha informados
// [usuarios] pega apenas o array com os registros retornados
try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
            [email, senha]
        );

if (usuarios.length > 0) {
            const usuario = usuarios[0];
            delete usuario.senha; //remove a senha por segurança antes de enviar ao frontend
            return res.status(200).json({ usuario });//sucesso
        } else {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });//user não encontrado
        }
} catch (erro) {
        console.error('Erro na autenticação:', erro); //exib o erro no terminal do servidor
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});


//======================
// rota buscar convenios 
//======================

app.get('/api/convenios', async (req, res) => {
    try {
        //busca os campos 'id' e 'nome' dos convênios em ordem alfabética
        const [convenios] = await db.query('SELECT id, nome FROM convenios ORDER BY nome ASC');
        return res.json(convenios);
    } catch (erro) {
        console.error('Erro ao buscar convênios:', erro);
        return res.status(500).json({ erro: 'Erro ao carregar lista de convênios.' });
    }
});

//=============================
// rota para cadastrar paciente
//=============================

app.post('/api/pacientes', async (req, res) => {
//desestrutura os dados do paciente recebidos no corpo da requisição (req.body)
    const {
        nome,
        dataNascimento,
        rg,
        cpf,
        nomeMae,
        nomePai,
        sexo,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        telefone,
        email,
        tipoAtendimentoId,
        convenioId,
        alergias
    } = req.body;

//validação de campos obrigatórios
    if (!nome || !dataNascimento || !rg || !cpf || !nomeMae || !sexo || !cep || !logradouro || !numero || !bairro || !cidade || !uf || !telefone || !tipoAtendimentoId) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }

//define a estrutura da instrução que será enviada ao banco de dados
const sql = `
        INSERT INTO pacientes (
            nome, data_nascimento, rg, cpf, nome_mae, nome_pai, sexo,
            cep, logradouro, numero, bairro, cidade, uf, telefone, email,
            tipo_atendimento_id, convenio_id, alergias
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

//array de parâmetros organizados na ordem exata esperada pela consulta SQL
const valores = [
        nome,
        dataNascimento,
        rg,
        cpf,
        nomeMae,
        nomePai || null,
        sexo,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        telefone,
        email || null,
        tipoAtendimentoId,
        convenioId || null,
        alergias || null
    ];

try {
        const [resultado] = await db.execute(sql, valores);
        return res.status(201).json({
            mensagem: 'Paciente cadastrado com sucesso!',
            //retorna o ID que o banco acabou de gerar para esse novo paciente
            idPaciente: resultado.insertI
        });
} catch (erro) {
        console.error('Erro ao cadastrar paciente:', erro);
if (erro.errno === 1062) {
            return res.status(400).json({ erro: 'Este CPF já está cadastrado no sistema.' });
        }

        return res.status(500).json({ erro: 'Erro ao salvar o paciente no banco de dados.' });
    }
});

//-----------------------------
//ROTA BUSCAR PACIENTES CADASTRO
//------------------------------

// (err, results) são os dois parâmetros devolvidos automaticamente pelo banco de dados:
// err: Armazena as informações de falha caso ocorra algum erro no MySQL 
// results: Armazena os dados retornados pelo banco em caso de sucesso.

//define uma rota HTTP do tipo GET no endpoint /pacientes
app.get('/pacientes', (req, res) => {
    const query = 'SELECT * FROM pacientes ORDER BY data_cadastro DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar pacientes:', err);
            return res.status(500).json({ error: 'Erro ao buscar registros.' });
        }
        res.status(200).json(results);
    });
});