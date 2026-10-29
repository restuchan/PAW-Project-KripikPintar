const ProdukModel = require('../models/produkModel');
const config = require('../config');
const formatRupiah = require('../utils/formatRupiah');

// GET /  -> halaman Beranda
exports.index = (req, res) => {
  const produk = ProdukModel.getAll().map((p) => ({
    ...p,
    hargaFormat: formatRupiah(p.harga),
  }));

  res.render('index', {
    judul: `${config.appName} - Kripik buah khas Malang`,
    namaToko: config.appName,
    produk,
  });
};
