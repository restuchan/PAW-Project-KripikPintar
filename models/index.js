const sequelize = require('../config/database');
const User = require('./userModel');
const Produk = require('./produkModel');
const Caption = require('./captionModel');

// Relasi antar tabel
User.hasMany(Produk, { foreignKey: 'userId', onDelete: 'SET NULL' });
Produk.belongsTo(User, { foreignKey: 'userId' });

Produk.hasMany(Caption, { foreignKey: 'produkId', onDelete: 'CASCADE' });
Caption.belongsTo(Produk, { foreignKey: 'produkId' });

module.exports = { sequelize, User, Produk, Caption };
