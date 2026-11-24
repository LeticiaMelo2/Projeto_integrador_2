//o Express é uma biblioteca que transforma o Node.js em um servidor de internet. cria rotas(Ele é quem escuta as requisições que chegam do navegador, lê os dados enviados pelo formulário e devolve a resposta final.)
//Cross, Esta biblioteca serve para liberar a segurança do navegador, permitindo que a sua página HTML (frontend) consiga fazer requisições e conversar com este servidor Node.js (backend) sem ser bloqueada.

//Importação das bibliotecas (ferramentas) necessárias
const express = require('express');
const cors = require('cors');
const conectar = require('../scripts_integracao/conexao'); // Puxa a função de conexão comum ao MySQL


//Inicialização da aplicação Express
const app = express();

// Converte os valores enviados pelo formulário para o ENUM usado pelo MySQL.
function normalizarSexo(valor) {
    const sexo = String(valor || '').toLowerCase();

    if (sexo === 'm' || sexo === 'masculino') return 'M';
    if (sexo === 'f' || sexo === 'feminino') return 'F';
    return 'Outro';
}

app.use(cors());          // Autoriza as chamadas vindas do navegador (frontend)
app.use(express.json());  // Permite que o servidor entenda dados enviados em formato JSON

//Rota POST de Login 
app.post('/api/login', async (req, res) => {
    // Pega o e-mail e a senha enviados pelo formulário da tela de login
    const { email, senha } = req.body;

    // Valida se o utilizador preencheu os dois campos
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Por favor, informe o e-mail e a senha.' });
    }

    let conexao;

    try {
        // Abre uma conexão única com o banco 'meuprojeto'
        conexao = await conectar();

        // Comando SQL para verificar se existe um usuário ativo com esse e-mail e senha
        const query = `
            SELECT id, nome, email, perfil, registro_profissional 
            FROM usuarios 
            WHERE email = ? AND senha = ? 
        `;

        // Executa a busca no banco de dados 
        const [usuarios] = await conexao.query(query, [email, senha]);

        if (usuarios.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuario = usuarios[0];

        // Retorna os dados para o frontend
        res.json({
            mensagem: 'Login efetuado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                registro_profissional: usuario.registro_profissional
            }
        });

        // Captura qualquer erro do 'try', exibe a falha detalhada no terminal
        // e devolve o código HTTP 500 (Erro no Servidor) em formato JSON para a tela.
        } catch (erro) {
        console.error('Erro ao realizar login no MySQL:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor ao tentar fazer login.' });
        } finally {
        // Garante que a conexão com o MySQL seja sempre encerrada ao final
        if (conexao) {
            await conexao.end();
            console.log('Conexão encerrada com sucesso.');
        }
    }
});

const PORT = process.env.PORT || 3000;
// LIGA O SERVIDOR: Avisa o Express para começar a escutar os pedidos do navegador na porta configurada (3000)
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});

//=================================
// cadastrar ou verificar pacientes 
//=================================

//rota para cadastrar paciente ou registrar nova visita pelo CPF
app.post('/api/pacientes/cadastrar', async (req, res) => {
    //extrai os campos do formulário para variáveis individuais
    const { 
        nome, 
        cpf, 
        data_nascimento, 
        rg, 
        nome_mae, 
        nome_pai, 
        sexo, 
        cep, 
        logradouro, 
        numero, 
        bairro, 
        cidade, 
        uf, 
        telefone, 
        email,
        tipo_atendimento_id,
        convenio_id,
        tipo_sanguineo,
        alergias
    } = req.body;

    let conexao;

    try {
        //abre a conexão usando a função 'conectar' importada
        conexao = await conectar();

        //busca se o paciente já existe pelo CPF
        const sqlBusca = 'SELECT id FROM pacientes WHERE cpf = ?';
        const [results] = await conexao.query(sqlBusca, [cpf]);

        let pacienteId;

        if (results.length > 0) {
            // PACIENTE JÁ EXISTE: Recupera o ID cadastrado
            pacienteId = results[0].id;

            //atualiza os dados caso tenham mudado (ex: telefone ou endereço)
            const sqlUpdate = `
                UPDATE pacientes 
                SET nome = ?, nome_mae = ?, nome_pai = ?, 
                    sexo = ?, cep = ?, logradouro = ?, numero = ?, bairro = ?, 
                    cidade = ?, uf = ?, telefone = ?, email = ?, tipo_atendimento_id = ?, 
                    convenio_id = ?, alergias = ?
                WHERE id = ?
            `;

            //substituir os '?'
            const valoresUpdate = [
                nome, nome_mae, nome_pai, 
                normalizarSexo(sexo), cep, logradouro, numero, bairro, 
                cidade, uf, telefone, email, tipo_atendimento_id, 
                convenio_id, alergias,  pacienteId
            ];

            await conexao.query(sqlUpdate, valoresUpdate);
            

        } else {

            // PACIENTE NOVO: Insere o cadastro completo na tabela 'pacientes'
            const sqlInsert = `
                INSERT INTO pacientes 
                (nome, cpf, data_nascimento, rg, nome_mae, nome_pai, sexo, cep, logradouro, numero, bairro, cidade, uf, telefone, email, tipo_atendimento_id, convenio_id, tipo_sanguineo,
                alergias) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const valoresInsert = [
                nome, cpf, data_nascimento, rg, nome_mae, nome_pai, 
                normalizarSexo(sexo), cep, logradouro, numero, bairro, cidade, uf, telefone, email, 
                tipo_atendimento_id, convenio_id, tipo_sanguineo,
                alergias
            ];

            const [resultInsert] = await conexao.query(sqlInsert, valoresInsert);
            pacienteId = resultInsert.insertId;
        }
            //gera o registro na tabela de atendimento
        const sqlAtendimento = 'INSERT INTO atendimento (paciente_id, situacao_id) VALUES (?, 1)';
        const [resultAtendimento] = await conexao.query(sqlAtendimento, [pacienteId]);

        // retorna a resposta de sucesso em JSON
        return res.status(201).json({
            message: 'Atendimento registrado com sucesso!',
            numero_atendimento: resultAtendimento.insertId,
            paciente_id: pacienteId
        });

    } catch (erro) {
        console.error('Erro no cadastro/atendimento do paciente:', erro);
        return res.status(500).json({ 
            erro: 'Erro interno no servidor ao tentar processar o cadastro.',
            detalhe: erro.message 
        });
    } finally {
        //encerra conexão
        if (conexao) {
            await conexao.end();
            console.log('Conexão encerrada após o cadastro.');
        }
    }
});

function gerarAtendimento(pacienteId, res) {
    const sqlAtendimento = 'INSERT INTO atendimento (paciente_id, situacao_id) VALUES (?, 1)';

    db.query(sqlAtendimento, [pacienteId], (err, result) => {
        if (err) {
            console.error('Erro ao gerar atendimento:', err);
            return res.status(500).json({ error: 'Erro ao gerar número de atendimento.' });
        }

        // Retorna a chave 'numero_atendimento' esperada pelo alert no frontend
        res.status(201).json({
            message: 'Atendimento registrado com sucesso!',
            numero_atendimento: result.insertId,
            paciente_id: pacienteId
        });
    });
}

//======================================
// buscar pacientes (aguardando triagem)
//======================================

app.get('/api/pacientes/situacao/1', async (req, res) => {
    let conexao;

    try {
        conexao = await conectar();

        //cnsulta SQL com JOIN para buscar pacientes com atendimento ativo na situação 1
        const sql = `
            SELECT 
                a.id AS numero_atendimento,
                p.nome AS paciente_nome
            FROM atendimento a
            INNER JOIN pacientes p ON a.paciente_id = p.id
            WHERE a.situacao_id = 1
            ORDER BY a.id ASC
        `;

        const [pacientesEmEspera] = await conexao.query(sql);

        //retorna a lista de pacientes em formato JSON
        return res.json(pacientesEmEspera);

    } catch (erro) {
        console.error('Erro ao buscar pacientes:', erro);
        return res.status(500).json({ 
            erro: 'Erro interno ao carregar a lista de pacientes.',
            detalhe: erro.message 
        });
    } finally {
        if (conexao) {
            await conexao.end();
        }
    }
});

//======================================
// buscar todos os pacientes cadastrados
//======================================

// Retorna todos os pacientes e o atendimento mais recente de cada um.
app.get('/api/pacientes/cadastrados', async (req, res) => {
    let conexao;

    try {
        conexao = await conectar();

        const sql = `
            SELECT
                p.id AS paciente_id,
                p.nome AS paciente_nome,
                p.cpf,
                a.id AS numero_atendimento,
                a.situacao_id,
                COALESCE(s.nome, 'Sem atendimento') AS situacao_nome
            FROM pacientes p
            LEFT JOIN atendimento a ON a.paciente_id = p.id
                AND a.id = (
                    SELECT MAX(a2.id)
                    FROM atendimento a2
                    WHERE a2.paciente_id = p.id
                )
            LEFT JOIN situacoes s ON s.id = a.situacao_id
            WHERE s.id = 1
            ORDER BY p.nome ASC
        `;

        const [pacientes] = await conexao.query(sql);
        return res.json(pacientes);
    } catch (erro) {
        console.error('Erro ao buscar pacientes cadastrados:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao carregar os pacientes cadastrados.'
        });
    } finally {
        if (conexao) await conexao.end();
    }
});

// Fila do painel: mantém os atendimentos ativos e informa a situação atual
// (situacoes) e a classificação da triagem (triagens), quando já realizada.
app.get('/api/atendimentos/painel', async (req, res) => {
    let conexao;
    try {
        conexao = await conectar();
        const [rows] = await conexao.query(`
            SELECT
                a.id AS numero_atendimento,
                p.nome AS paciente_nome,
                s.id AS situacao_id,
                s.nome AS situacao_nome,
                t.classificacao_risco,
                a.criado_em,
                a.data_inicio,
                a.data_fim
            FROM atendimento a
            INNER JOIN pacientes p ON p.id = a.paciente_id
            INNER JOIN situacoes s ON s.id = a.situacao_id
            LEFT JOIN triagens t ON t.id_atendimento = a.id
            WHERE a.situacao_id = 1
            ORDER BY a.id ASC
        `);
        return res.json(rows);
    } catch (erro) {
        console.error('Erro ao carregar painel de atendimentos:', erro);
        return res.status(500).json({ erro: 'Erro interno ao carregar o painel.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

//====================
// icones atendimento
//====================

//busca de dados 
app.get('/api/pacientes/:numero_atendimento', async (req, res) => {
    //extrai da URL o valor que veio no lugar de :numero_atendimento e guarda na variável de mesmo nome
    const { numero_atendimento } = req.params;
    let conexao;

    try {
        conexao = await conectar();

        const sql = `
            SELECT 
                a.id AS numero_atendimento,
                a.situacao_id,
                p.*
            FROM atendimento a
            INNER JOIN pacientes p ON a.paciente_id = p.id
            WHERE a.id = ?
        `;

        //executa a consulta substituindo o '?' pelo número do atendimento
        const [rows] = await conexao.query(sql, [numero_atendimento]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }
 
        //devolve o primeiro (e único) objeto encontrado em formato JSON para o frontend
        return res.json(rows[0]);

    } catch (erro) {
        console.error('Erro ao buscar detalhes do atendimento:', erro);
        return res.status(500).json({ erro: 'Erro interno ao buscar detalhes.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

// editar dados do paciente pelo número do atendimento
app.put('/api/pacientes/:numero_atendimento', async (req, res) => {
    //extrai da URL o valor que veio no lugar de :numero_atendimento e guarda na variável de mesmo nome
    const { numero_atendimento } = req.params;
    const {
        nome, cpf, data_nascimento, rg, nome_mae, nome_pai,
        sexo, cep, logradouro, numero, bairro, cidade, uf,
        telefone, email, tipo_atendimento_id, convenio_id,
        tipo_sanguineo, alergias
    } = req.body;

    let conexao;

    try {
        conexao = await conectar();

        // Atualiza a tabela pacientes fazendo JOIN com atendimento
        const sqlUpdate = `
            UPDATE pacientes p
            INNER JOIN atendimento a ON p.id = a.paciente_id
            SET 
                p.nome = ?, p.cpf = ?, p.data_nascimento = ?, p.rg = ?,
                p.nome_mae = ?, p.nome_pai = ?, p.sexo = ?, p.cep = ?,
                p.logradouro = ?, p.numero = ?, p.bairro = ?, p.cidade = ?,
                p.uf = ?, p.telefone = ?, p.email = ?, p.tipo_atendimento_id = ?,
                p.convenio_id = ?, p.tipo_sanguineo = ?, p.alergias = ?
            WHERE a.id = ?
        `;

        const valores = [
            nome, cpf, data_nascimento, rg, nome_mae, nome_pai,
            normalizarSexo(sexo), cep, logradouro, numero, bairro, cidade, uf,
            telefone, email, tipo_atendimento_id, convenio_id,
            tipo_sanguineo, alergias, numero_atendimento
        ];

        await conexao.query(sqlUpdate, valores);

        return res.json({ mensagem: 'Cadastro do paciente atualizado com sucesso!' });

    } catch (erro) {
        console.error('Erro ao editar paciente:', erro);
        return res.status(500).json({ erro: 'Erro interno ao atualizar paciente.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

// Edita diretamente o cadastro do paciente, sem criar atendimento ou paciente novo.
app.put('/api/pacientes/cadastro/:paciente_id', async (req, res) => {
    const { paciente_id } = req.params;
    const {
        nome, cpf, data_nascimento, rg, nome_mae, nome_pai,
        sexo, cep, logradouro, numero, bairro, cidade, uf,
        telefone, email, tipo_atendimento_id, convenio_id,
        tipo_sanguineo, alergias
    } = req.body;

    let conexao;

    try {
        conexao = await conectar();

        const sql = `
            UPDATE pacientes
            SET nome = ?, cpf = ?, data_nascimento = ?, rg = ?,
                nome_mae = ?, nome_pai = ?, sexo = ?, cep = ?,
                logradouro = ?, numero = ?, bairro = ?, cidade = ?,
                uf = ?, telefone = ?, email = ?, tipo_atendimento_id = ?,
                convenio_id = ?, tipo_sanguineo = ?, alergias = ?
            WHERE id = ?
        `;

        const valores = [
            nome, cpf, data_nascimento, rg, nome_mae, nome_pai,
            normalizarSexo(sexo), cep, logradouro, numero, bairro, cidade,
            uf, telefone, email, tipo_atendimento_id, convenio_id,
            tipo_sanguineo, alergias, paciente_id
        ];

        const [resultado] = await conexao.query(sql, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        return res.json({ mensagem: 'Paciente atualizado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar cadastro do paciente:', erro);
        return res.status(500).json({ erro: 'Erro interno ao atualizar o paciente.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

//cancelar atendimento
app.patch('/api/pacientes/:numero_atendimento/cancelar', async (req, res) => {
    //extrai da URL o valor que veio no lugar de :numero_atendimento e guarda na variável de mesmo nome
    const { numero_atendimento } = req.params;
    let conexao;

    try {
        conexao = await conectar();

        const sqlCancelar = `
            UPDATE atendimento 
            SET situacao_id = 6 
            WHERE id = ?
        `;

        const [result] = await conexao.query(sqlCancelar, [numero_atendimento]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }

        return res.json({ mensagem: 'Atendimento cancelado com sucesso!' });

    } catch (erro) {
        console.error('Erro ao cancelar atendimento:', erro);
        return res.status(500).json({ erro: 'Erro interno ao cancelar atendimento.' });
    } finally {
        if (conexao) await conexao.end();
    }

});

//=====================
//   iniciar triagem
//=====================

app.patch('/api/atendimentos/:numero_atendimento/iniciar-triagem', async (req, res) => {
    //extrai da URL o valor que veio no lugar de :numero_atendimento e guarda na variável de mesmo nome
    const { numero_atendimento } = req.params;
    let conexao;

    try {
        conexao = await conectar();

        const sql = `
            UPDATE atendimento 
            SET situacao_id = 2 
            WHERE id = ?
        `;

        const [result] = await conexao.query(sql, [numero_atendimento]);

        // se nenhuma linha for afetada 
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }

        return res.json({ mensagem: 'Atendimento iniciado! Redirecionando para triagem...' });

    } catch (erro) {
        console.error('Erro ao iniciar triagem:', erro);
        return res.status(500).json({ erro: 'Erro interno ao atualizar status do atendimento.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

//=========================
//        relatórios
//=========================
app.get('/api/relatorios', async (req, res) => {
    const { status, medico, prioridade, data } = req.query;
    let conexao;

    try {
        conexao = await conectar();

        const filtros = [];
        const valores = [];

        if (status) {
            filtros.push('a.situacao_id = ?');
            valores.push(status);
        }
        if (medico) {
            filtros.push('a.usuario_medico_id = ?');
            valores.push(medico);
        }
        if (prioridade) {
            filtros.push('LOWER(t.classificacao_risco) LIKE ?');
            valores.push(`%${prioridade.toLowerCase()}%`);
        }
        if (data) {
            filtros.push('DATE(a.criado_em) = ?');
            valores.push(data);
        }

        const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
        const [resumo] = await conexao.query(`
            SELECT
                COUNT(DISTINCT p.id) AS quantidade_pacientes,
                COUNT(DISTINCT a.id) AS quantidade_atendimentos
            FROM pacientes p
            LEFT JOIN atendimento a ON a.paciente_id = p.id
            LEFT JOIN triagens t ON t.id_atendimento = a.id
            ${where}
        `, valores);

        const [porSituacao] = await conexao.query(`
            SELECT s.id, s.nome, COUNT(a.id) AS quantidade
            FROM situacoes s
            LEFT JOIN atendimento a ON a.situacao_id = s.id
            LEFT JOIN triagens t ON t.id_atendimento = a.id
            ${where}
            GROUP BY s.id, s.nome
            ORDER BY s.id
        `, valores);

        const [porTipo] = await conexao.query(`
            SELECT ta.id, ta.nome, COUNT(a.id) AS quantidade
            FROM tipos_atendimento ta
            LEFT JOIN pacientes p ON p.tipo_atendimento_id = ta.id
            LEFT JOIN atendimento a ON a.paciente_id = p.id
            LEFT JOIN triagens t ON t.id_atendimento = a.id
            ${where}
            GROUP BY ta.id, ta.nome
            ORDER BY ta.nome
        `, valores);

        const [porPrioridade] = await conexao.query(`
            SELECT COALESCE(t.classificacao_risco, 'Não classificado') AS nome,
                   COUNT(a.id) AS quantidade
            FROM atendimento a
            LEFT JOIN triagens t ON t.id_atendimento = a.id
            ${where}
            GROUP BY t.classificacao_risco
            ORDER BY quantidade DESC
        `, valores);

        return res.json({
            resumo: resumo[0],
            por_situacao: porSituacao,
            por_tipo_atendimento: porTipo,
            por_prioridade: porPrioridade
        });
    } catch (erro) {
        console.error('Erro ao carregar relatório:', erro);
        return res.status(500).json({ erro: 'Erro interno ao carregar relatório.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

app.get('/api/relatorios/filtros', async (req, res) => {
    let conexao;
    try {
        conexao = await conectar();
        const [situacoes] = await conexao.query('SELECT id, nome FROM situacoes ORDER BY id');
        const [medicos] = await conexao.query("SELECT id, nome FROM usuarios WHERE perfil = 'medico' ORDER BY nome");
        return res.json({ situacoes, medicos });
    } catch (erro) {
        console.error('Erro ao carregar filtros do relatório:', erro);
        return res.status(500).json({ erro: 'Erro interno ao carregar filtros.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

//========================
// indicadores de  triagem
//========================

app.get('/api/triagem/indicadores', async (req, res) => {
    let conexao;

    try {
        conexao = await conectar();

        //conta quantos estão aguardando triagem (situacao_id = 1)
        const [aguardando] = await conexao.query(
            'SELECT COUNT(*) AS total FROM atendimento WHERE situacao_id = 1'
        );

    
        const [atendidos] = await conexao.query(
            'SELECT COUNT(*) AS total FROM atendimento WHERE situacao_id IN (5)'
        );

        return res.json({
            aguardando_triagem: aguardando[0].total,
            atendidos_hoje: atendidos[0].total
        });

    } catch (erro) {
        console.error('Erro ao buscar indicadores da triagem:', erro);
        return res.status(500).json({ erro: 'Erro interno ao buscar indicadores.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

//=========================
//   salvar dados triagem
//==========================
app.post('/api/triagens', async (req, res) => {
    const {
        id_atendimento,
        classificacao_risco,
        principais_queixas,
        pressao_arterial,
        temp_corporal,
        batimentos_cardiacos,
        observacoes
    } = req.body;

    if (!id_atendimento || !classificacao_risco || !pressao_arterial || !temp_corporal || !batimentos_cardiacos) {
        return res.status(400).json({ erro: 'Preencha todos os sinais vitais e selecione a classificação de risco.' });
    }

    let conexao;

    try {
        conexao = await conectar();

        const sqlInsert = `
            INSERT INTO TRIAGENS (
                id_atendimento,
                classificacao_risco,
                principais_queixas,
                pressao_arterial,
                temp_corporal,
                batimentos_cardiacos,
                observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await conexao.query(sqlInsert, [
            id_atendimento,
            classificacao_risco,
            principais_queixas,
            pressao_arterial,
            temp_corporal,
            batimentos_cardiacos,
            observacoes
        ]);

        //muda p status 3 (aguardando atendimento)
        await conexao.query(
            'UPDATE atendimento SET situacao_id = 3 WHERE id = ?',
            [id_atendimento]
        );

        //grava no banco
        await conexao.commit();
        return res.status(201).json({ mensagem: 'Triagem salva com sucesso!' });

    } catch (erro) {
        //caso tentem salvar duas triagens para o mesmo atendimento
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'Este atendimento já possui uma triagem registrada.' });
        }

        return res.status(500).json({ erro: 'Erro interno ao salvar triagem no banco.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

//===================
// tabela atendimento
//====================

app.get('/api/atendimentos/aguardando', async (req, res) => {
    let conexao;

    try {
        conexao = await conectar();

        const sql = `
            SELECT 
                a.id AS id_atendimento,
                p.nome AS nome_paciente,
                t.classificacao_risco
            FROM atendimento a
            INNER JOIN pacientes p ON a.paciente_id = p.id
            INNER JOIN TRIAGENS t ON t.id_atendimento = a.id
            WHERE a.situacao_id = 3
            ORDER BY a.id ASC
        `;

        const [rows] = await conexao.query(sql);
        return res.status(200).json(rows);

    } catch (erro) {
        console.error('Erro ao buscar fila:', erro);
        return res.status(500).json({ erro: 'Erro interno ao buscar fila.' });
    } finally {
        if (conexao) await conexao.end();
    }
});


// =========================================================================
// ao apertar "Chamar", muda para "Em Atendimento" e traz os dados
// =========================================================================
app.get('/api/atendimentos/:id', async (req, res) => {
    let conexao;
    const { id } = req.params;

    try {
        conexao = await conectar();

        const sql = `
            SELECT 
                a.id AS id_atendimento,
                p.nome AS nome_paciente,
                p.data_nascimento,
                p.alergias,
                t.*
            FROM atendimento a
            INNER JOIN pacientes p ON a.paciente_id = p.id
            INNER JOIN TRIAGENS t ON t.id_atendimento = a.id
            WHERE a.id = ?
        `;

        const [rows] = await conexao.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Atendimento não encontrado.' });
        }

        // Atualiza o status do paciente para "Em Atendimento" (situacao_id = 4)
        await conexao.query('UPDATE atendimento SET situacao_id = 4 WHERE id = ?', [id]);

        return res.status(200).json(rows[0]);

    } catch (erro) {
        console.error('Erro ao buscar detalhes do paciente:', erro);
        return res.status(500).json({ erro: 'Erro interno ao buscar detalhes.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

// =========================================================================
// salvar os dados da consulta médica e muda situacao_id para 5
// =========================================================================
app.post('/api/atendimentos/:id/finalizar', async (req, res) => {
    let conexao;
    const { id } = req.params;
    const { diagnostico, prescricao } = req.body;

    try {
        conexao = await conectar();

        // Insere os dados clínicos na tabela de consultas (ajuste o nome da tabela/colunas conforme seu banco)
        const sqlInsert = `
            INSERT INTO consultas (atendimento_id, diagnostico, prescricao)
            VALUES (?, ?, ?)
        `;
        await conexao.query(sqlInsert, [id, diagnostico, prescricao]);

        // 2. Atualiza o status do atendimento para 5 ("Atendido / Finalizado")
        await conexao.query('UPDATE atendimento SET situacao_id = 5 WHERE id = ?', [id]);

        return res.status(200).json({ mensagem: 'Paciente atendido com sucesso!' });

    } catch (erro) {
        console.error('Erro ao finalizar atendimento:', erro);
        return res.status(500).json({ erro: 'Erro interno ao finalizar atendimento.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

// Histórico de pacientes. A busca é opcional e aceita CPF completo ou parcial.
app.get('/api/historico/pacientes', async (req, res) => {
    let conexao;
    const cpf = String(req.query.cpf || '').trim();
    try {
        conexao = await conectar();
        const [pacientes] = await conexao.query(`
            SELECT id, nome, cpf, data_nascimento, telefone, email
            FROM pacientes
            WHERE cpf LIKE ?
            ORDER BY nome ASC
        `, [`%${cpf}%`]);
        return res.json(pacientes);
    } catch (erro) {
        console.error('Erro ao carregar histórico de pacientes:', erro);
        return res.status(500).json({ erro: 'Erro interno ao carregar o histórico.' });
    } finally {
        if (conexao) await conexao.end();
    }
});

app.get('/api/historico/pacientes/:id', async (req, res) => {
    let conexao;
    try {
        conexao = await conectar();
        const [pacientes] = await conexao.query(`
            SELECT
                p.*,
                ta.nome AS tipo_atendimento_nome,
                cv.nome AS convenio_nome
            FROM pacientes p
            LEFT JOIN tipos_atendimento ta ON ta.id = p.tipo_atendimento_id
            LEFT JOIN convenios cv ON cv.id = p.convenio_id
            WHERE p.id = ?
        `, [req.params.id]);
        if (!pacientes.length) {
            return res.status(404).json({ erro: 'Paciente não encontrado.' });
        }

        const [atendimentos] = await conexao.query(`
            SELECT
                a.id AS numero_atendimento,
                a.criado_em,
                a.data_inicio,
                a.data_fim,
                s.nome AS situacao_nome,
                t.classificacao_risco,
                t.principais_queixas,
                t.pressao_arterial,
                t.temp_corporal,
                t.batimentos_cardiacos,
                t.observacoes AS observacoes_triagem,
                c.diagnostico,
                c.prescricao,
                c.observacoes AS observacoes_consulta,
                u.nome AS medico_nome
            FROM atendimento a
            LEFT JOIN situacoes s ON s.id = a.situacao_id
            LEFT JOIN triagens t ON t.id_atendimento = a.id
            LEFT JOIN consultas c ON c.atendimento_id = a.id
            LEFT JOIN usuarios u ON u.id = a.usuario_medico_id
            WHERE a.paciente_id = ?
            ORDER BY a.criado_em DESC, a.id DESC
        `, [req.params.id]);

        return res.json({ paciente: pacientes[0], atendimentos });
    } catch (erro) {
        console.error('Erro ao carregar detalhes históricos:', erro);
        return res.status(500).json({ erro: 'Erro interno ao carregar os detalhes históricos.' });
    } finally {
        if (conexao) await conexao.end();
    }
});
