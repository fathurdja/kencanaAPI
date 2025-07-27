const express = require('express');
const serverless = require('serverless-http');
const app = express();
const pool = require('../express/utils/db');

app.use(express.json());

// GET /master
app.get('/master', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM munit');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data master' });
  }
});

// POST /transaksi
app.post('/transaksi', async (req, res) => {
  const { id_transaksi, customerName, alamat, date, total, items } = req.body;

  if (!id_transaksi) {
    return res.status(400).json({ error: 'id_transaksi harus disertakan' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Simpan ke tabel transaksi
    await conn.query(
      `INSERT INTO transaksi (id_transaksi, customer_name, alamat, tanggal, total)
       VALUES (?, ?, ?, ?, ?)`,
      [id_transaksi, customerName, alamat, date, total]
    );

    // Simpan ke tabel item_transaksi
    for (const item of items) {
      await conn.query(
        `INSERT INTO item_transaksi (id_transaksi, nama_barang, harga, jumlah, bonus, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id_transaksi,
          item.name,
          item.price,
          item.quantity,
          item.bonus || 0,
          item.subtotal
        ]
      );
    }

    await conn.commit();
    res.json({ success: true, id_transaksi });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Gagal menyimpan transaksi', detail: err.message });
  } finally {
    conn.release();
  }
});
// GET /transaksi - semua transaksi + item
app.get('/transaksi', async (req, res) => {
  try {
    // Ambil semua transaksi
    const [transaksiRows] = await pool.query(`
      SELECT id_transaksi, customer_name, alamat, tanggal, total 
      FROM transaksi
    `);

    // Ambil semua item
    const [itemRows] = await pool.query(`
      SELECT id_transaksi, nama_barang AS name, harga AS price, jumlah AS quantity, bonus, subtotal 
      FROM item_transaksi
    `);

    // Gabungkan item ke dalam transaksi yang sesuai
    const transaksiMap = transaksiRows.map(transaksi => {
      const items = itemRows.filter(item => item.id_transaksi === transaksi.id_transaksi);
      return {
        id_transaksi: transaksi.id_transaksi,
        customerName: transaksi.customer_name,
        alamat: transaksi.alamat,
        date: transaksi.tanggal,
        total: transaksi.total,
        items: items
      };
    });

    res.json(transaksiMap);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil transaksi', detail: err.message });
  }
});


// Untuk run lokal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.handler = serverless(app);
