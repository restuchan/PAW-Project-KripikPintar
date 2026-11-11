// Koneksi database dikelola di satu tempat ini saja.
require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kripikpintar',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // ubah ke console.log jika ingin melihat query SQL
  }
);

module.exports = sequelize;
