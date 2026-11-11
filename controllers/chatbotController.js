const Produk = require('../models/produkModel');
const { jawab } = require('../utils/chatbot');
const { bungkus } = require('../utils/http');

// POST /api/chatbot
exports.jawab = bungkus(async (req, res) => {
  const pesan = String(req.body.pesan || '').trim();
  if (!pesan) return res.status(400).json({ sukses: false, pesan: 'Pesan tidak boleh kosong' });
  if (pesan.length > 200) return res.status(400).json({ sukses: false, pesan: 'Pesan maksimal 200 karakter' });

  const daftarProduk = await Produk.ambilSemua();
  const hasil = jawab(pesan, daftarProduk);
  res.json({ sukses: true, jawaban: hasil.jawaban, aksiWa: hasil.aksiWa });
});
