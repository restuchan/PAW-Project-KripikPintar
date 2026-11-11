const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Caption = sequelize.define(
  'Caption',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    produkId: { type: DataTypes.INTEGER, allowNull: false },
    teks: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: 'caption', timestamps: true, underscored: true }
);

Caption.riwayatProduk = function (produkId, batas = 3) {
  return this.findAll({
    where: { produkId },
    order: [['createdAt', 'DESC']],
    limit: batas,
  });
};

Caption.simpan = function (produkId, teks) {
  return this.create({ produkId, teks });
};

module.exports = Caption;
