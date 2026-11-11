const { DataTypes, Op } = require('sequelize');
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

// Memastikan HANYA ada satu akun pemilik, sesuai username dan password di .env.
// - akun pemilik lain dihapus
// - jika username sudah ada tetapi password beda, password diperbarui
// Mengembalikan 'dibuat', 'diperbarui', atau 'tetap'.
User.pastikanPemilik = async function (username, password) {
  await this.destroy({ where: { role: 'pemilik', username: { [Op.ne]: username } } });

  const ada = await this.findOne({ where: { username } });
  if (!ada) {
    await this.buat({ username, password, role: 'pemilik' });
    return 'dibuat';
  }
  if (ada.role === 'pemilik' && (await ada.cocokPassword(password))) return 'tetap';

  await ada.update({ role: 'pemilik', password: await bcrypt.hash(password, 10) });
  return 'diperbarui';
};

User.prototype.cocokPassword = function (passwordAsli) {
  return bcrypt.compare(passwordAsli, this.password);
};

module.exports = User;
