const mysql = require('mysql2'); // Ou o banco que você estiver usando

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'seu_banco'
});

module.exports = pool.promise();
