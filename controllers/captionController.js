const Produk = require('../models/produkModel');
const Caption = require('../models/captionModel');
const { buatCaption: buatCaptionTemplate } = require('../utils/captionGenerator');
const { buatCaptionGemini, GeminiError } = require('../services/gemini.service');
const { bungkus, idValid } = require('../utils/http');

// Jika Gemini gagal, pakai caption template agar alur pemilik tidak terhenti (matikan dengan CAPTION_FALLBACK=off)
const PAKAI_CADANGAN = (process.env.CAPTION_FALLBACK || 'on').toLowerCase() !== 'off';

async function ambilProduk(req, res) {
  const id = idValid(req.params.id);
  const produk = id && (await Produk.ambilById(id));
  if (!produk) {
    res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
    return null;
  }
  return produk;
}

// POST /api/produk/:id/caption/generate  -> membuat caption dengan Gemini (belum disimpan)
// Respons: { sukses, caption, variasi, sumber: 'gemini' | 'template' }
exports.generate = bungkus(async (req, res) => {
  const produk = await ambilProduk(req, res);
  if (!produk) return;
  const hindari = Number.isInteger(req.body.variasi) ? req.body.variasi : undefined;

  try {
    const { teks, variasi } = await buatCaptionGemini(produk, hindari);
    return res.json({ sukses: true, caption: teks, variasi, sumber: 'gemini' });
  } catch (err) {
    if (!(err instanceof GeminiError)) throw err;
    console.error(`Caption Gemini gagal [${err.kode}]${err.detail ? ': ' + err.detail : ''}`);

    if (PAKAI_CADANGAN) {
      const { teks, variasi } = buatCaptionTemplate(produk, hindari);
      return res.json({ sukses: true, caption: teks, variasi, sumber: 'template' });
    }
    return res.status(err.status).json({ sukses: false, pesan: err.pesanPengguna });
  }
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
