const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produk = sequelize.define(
  'Produk',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING(120), allowNull: false },
    kategori: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'Kripik buah' },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    harga: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    stok: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    foto: { type: DataTypes.STRING, allowNull: true }, // path file, contoh: /uploads/123.jpg
    keunggulan: { type: DataTypes.TEXT, allowNull: true },
    targetPembeli: { type: DataTypes.STRING(150), allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true }, // pemilik yang membuat produk
  },
  { tableName: 'produk', timestamps: true, underscored: true }
);

// ----- Operasi data (dipanggil oleh controller) -----
Produk.ambilSemua = function () {
  return this.findAll({ order: [['id', 'ASC']] });
};

Produk.ambilById = function (id) {
  return this.findByPk(id);
};

Produk.tambah = function (data) {
  return this.create(data);
};

Produk.ubah = async function (id, data) {
  const produk = await this.findByPk(id);
  if (!produk) return null;
  return produk.update(data);
};

Produk.hapus = async function (id) {
  const produk = await this.findByPk(id);
  if (!produk) return null;
  await produk.destroy();
  return produk;
};

module.exports = Produk;
