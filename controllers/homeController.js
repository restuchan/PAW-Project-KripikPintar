const config = require('../config');
const Produk = require('../models/produkModel');
const Caption = require('../models/captionModel');
const formatRupiah = require('../utils/formatRupiah');
const { bungkus, idValid } = require('../utils/http');

// Mengubah baris database menjadi objek biasa + harga berformat rupiah
const siapkan = (p) => ({ ...p.toJSON(), hargaFormat: formatRupiah(p.harga) });

// GET /  -> Beranda (tampilan berbeda untuk pemilik dan pembeli)
exports.index = bungkus(async (req, res) => {
  const produk = (await Produk.ambilSemua()).map(siapkan);
  res.render('index', {
    judul: `${config.appName} - Kripik buah khas Malang`,
    namaToko: config.appName,
    produk,
    whatsappNomor: config.whatsappNomor,
  });
});

// GET /produk/baru  -> Form Produk (tambah)
exports.formTambah = (req, res) => {
  res.render('produk/form', {
    judul: 'Tambah Produk - KripikPintar',
    namaToko: config.appName,
    mode: 'tambah',
    produk: null,
  });
};

// GET /produk/:id/edit  -> Form Produk (ubah)
exports.formUbah = bungkus(async (req, res) => {
  const id = idValid(req.params.id);
  const produk = id && (await Produk.ambilById(id));
  if (!produk) return res.redirect('/');
  res.render('produk/form', {
    judul: 'Ubah Produk - KripikPintar',
    namaToko: config.appName,
    mode: 'ubah',
    produk: siapkan(produk),
  });
});

// GET /produk/:id/caption  -> Hasil AI
exports.halamanCaption = bungkus(async (req, res) => {
  const id = idValid(req.params.id);
  const produk = id && (await Produk.ambilById(id));
  if (!produk) return res.redirect('/');
  const riwayat = await Caption.riwayatProduk(produk.id, 3);
  res.render('produk/caption', {
    judul: 'Hasil Caption - KripikPintar',
    namaToko: config.appName,
    produk: siapkan(produk),
    riwayat: riwayat.map((c) => c.toJSON()),
  });
});
