//require('mysql2') É o comando que conecta o seu programa (Node.js) com o banco de dados (MySQL).
//mysql2 é o que permite fazer o seu código rodar comandos no banco de dados (como salvar, buscar ou apagar registros).
// /promise faz o seu código esperar o banco de dados responder de um jeito fácil de escrever.
const mysql = require('mysql2/promise');
//essa linha faz o Node.js carregar todas as variáveis do arquivo .env para a memória do sistema.
require('dotenv').config();

// função para abrir uma conexão com o BD
//async (Assíncrono): Avisa o JavaScript que essa função vai fazer algo que demora um tempinho (que é conectar ao MySQL).
async function conectar() {
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'clinica_db',
        port: process.env.DB_PORT || 3306
    });

    //mensagem sucesso terminal
    console.log('Conexão comum criada com sucesso!');
    return conexao;
}

//Coloca a função para FORA do arquivo, permite o acesso da fun. conectar
module.exports = conectar;