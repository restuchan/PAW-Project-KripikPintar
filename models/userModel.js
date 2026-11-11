const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // berisi hash, bukan teks asli
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pembeli',
      validate: { isIn: [['pemilik', 'pembeli']] },
    },
  },
  { tableName: 'users', timestamps: true, underscored: true }
);

// ----- Operasi data -----
User.cariByUsername = function (username) {
  return this.findOne({ where: { username } });
};

User.buat = async function ({ username, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  return this.create({ username, password: hash, role });
};

User.prototype.cocokPassword = function (passwordAsli) {
  return bcrypt.compare(passwordAsli, this.password);
};

module.exports = User;
