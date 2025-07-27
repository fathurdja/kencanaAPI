const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: 'localhost',     // ubah ke host db kamu
//   user: 'root',
//   password: '',
//   database: 'apikasirdev',
//   waitForConnections: true,
//   connectionLimit: 10,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,     // dari .env atau Environment Variables di Vercel
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

