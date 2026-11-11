// Endpoint CRUD produk. Query database ada di models/produkModel.js
const fs = require('fs');
const path = require('path');
const config = require('../config');
const Produk = require('../models/produkModel');
const { bungkus, idValid } = require('../utils/http');

// Menghapus file foto lama dari folder uploads (aman jika file tidak ada)
function hapusFile(pathFoto) {
  if (!pathFoto || !pathFoto.startsWith('/uploads/')) return;
  fs.unlink(path.join(config.uploadDir, path.basename(pathFoto)), () => {});
}

const teksOpsional = (v) => {
  if (v === undefined) return undefined;
  const t = String(v).trim();
  return t === '' ? null : t;
};

// wajib = true untuk POST (nama dan harga harus ada), false untuk PUT (hanya field yang dikirim)
function validasi(body, wajib) {
  const data = {};

  if (wajib || body.nama !== undefined) {
    const nama = String(body.nama || '').trim();
    if (!nama) return { pesan: 'Nama produk belum diisi' };
    if (nama.length > 120) return { pesan: 'Nama produk maksimal 120 karakter' };
    data.nama = nama;
  }
  if (wajib || body.harga !== undefined) {
    const harga = Number(String(body.harga ?? '').trim());
    if (String(body.harga ?? '').trim() === '') return { pesan: 'Harga belum diisi' };
    if (!Number.isInteger(harga) || harga < 0) return { pesan: 'Harga harus berupa angka bulat 0 atau lebih' };
    data.harga = harga;
  }
  if (body.stok !== undefined || wajib) {
    const mentah = String(body.stok ?? '0').trim() || '0';
    const stok = Number(mentah);
    if (!Number.isInteger(stok) || stok < 0) return { pesan: 'Stok harus berupa angka bulat 0 atau lebih' };
    data.stok = stok;
  }
  for (const kolom of ['kategori', 'deskripsi', 'keunggulan', 'targetPembeli']) {
    const nilai = teksOpsional(body[kolom]);
    if (nilai !== undefined) data[kolom] = nilai;
  }
  if (data.kategori === null) delete data.kategori; // kategori tidak boleh kosong, pakai bawaan
  return { data };
}

// GET /api/produk
exports.daftar = bungkus(async (req, res) => {
  const data = await Produk.ambilSemua();
  res.json({ sukses: true, jumlah: data.length, data });
});

// GET /api/produk/:id
exports.detail = bungkus(async (req, res) => {
  const id = idValid(req.params.id);
  const produk = id && (await Produk.ambilById(id));
  if (!produk) return res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
  res.json({ sukses: true, data: produk });
});

// POST /api/produk
exports.tambah = bungkus(async (req, res) => {
  const { data, pesan } = validasi(req.body, true);
  if (pesan) {
    if (req.file) hapusFile('/uploads/' + req.file.filename);
    return res.status(400).json({ sukses: false, pesan });
  }
  data.userId = req.session.user.id;
  if (req.file) data.foto = '/uploads/' + req.file.filename;

  const baru = await Produk.tambah(data);
  res.status(201).json({ sukses: true, pesan: 'Produk berhasil ditambahkan', data: baru });
});

// PUT /api/produk/:id
exports.ubah = bungkus(async (req, res) => {
  const id = idValid(req.params.id);
  const lama = id && (await Produk.ambilById(id));
  if (!lama) {
    if (req.file) hapusFile('/uploads/' + req.file.filename);
    return res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
  }

  const { data, pesan } = validasi(req.body, false);
  if (pesan) {
    if (req.file) hapusFile('/uploads/' + req.file.filename);
    return res.status(400).json({ sukses: false, pesan });
  }
  if (req.file) {
    data.foto = '/uploads/' + req.file.filename;
    hapusFile(lama.foto);
  }

  const baru = await lama.update(data);
  res.json({ sukses: true, pesan: 'Produk berhasil diperbarui', data: baru });
});

// DELETE /api/produk/:id
exports.hapus = bungkus(async (req, res) => {
  const id = idValid(req.params.id);
  const terhapus = id && (await Produk.hapus(id));
  if (!terhapus) return res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
  hapusFile(terhapus.foto);
  res.json({ sukses: true, pesan: 'Produk berhasil dihapus' });
});
