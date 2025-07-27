const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',     // ubah ke host db kamu
  user: 'root',
  password: '',
  database: 'apikasirdev',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
