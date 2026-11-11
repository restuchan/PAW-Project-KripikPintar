const Produk = require('../models/produkModel');
const Caption = require('../models/captionModel');
const { buatCaption } = require('../utils/captionGenerator');
const { bungkus, idValid } = require('../utils/http');

async function ambilProduk(req, res) {
  const id = idValid(req.params.id);
  const produk = id && (await Produk.ambilById(id));
  if (!produk) {
    res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
    return null;
  }
  return produk;
}

// POST /api/produk/:id/caption/generate  -> membuat caption (belum disimpan)
exports.generate = bungkus(async (req, res) => {
  const produk = await ambilProduk(req, res);
  if (!produk) return;
  const hindari = Number.isInteger(req.body.variasi) ? req.body.variasi : undefined;
  const { teks, variasi } = buatCaption(produk, hindari);
  res.json({ sukses: true, caption: teks, variasi });
});

// GET /api/produk/:id/caption  -> riwayat caption yang tersimpan
exports.riwayat = bungkus(async (req, res) => {
  const produk = await ambilProduk(req, res);
  if (!produk) return;
  const data = await Caption.riwayatProduk(produk.id, 10);
  res.json({ sukses: true, jumlah: data.length, data });
});

// POST /api/produk/:id/caption  -> menyimpan caption ke riwayat
exports.simpan = bungkus(async (req, res) => {
  const produk = await ambilProduk(req, res);
  if (!produk) return;
  const teks = String(req.body.teks || '').trim();
  if (!teks) return res.status(400).json({ sukses: false, pesan: 'Caption tidak boleh kosong' });
  if (teks.length > 2000) return res.status(400).json({ sukses: false, pesan: 'Caption maksimal 2000 karakter' });
  const data = await Caption.simpan(produk.id, teks);
  res.status(201).json({ sukses: true, pesan: 'Caption berhasil disimpan', data });
});
