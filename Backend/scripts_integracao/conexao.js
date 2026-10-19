import 'dotenv/config';
import mysql from 'mysql2/promise';

async function getConnection() {
  let connection;
  try {
    // 1. Estabelecer conexão
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME // O banco deve existir previamente, se não ele sera gerado em 'startup.js'
      
    });
  } catch (error) {
     console.error('Erro ao conectar:', error.message);
     throw error;
    }
    return connection;
  }

export { getConnection };