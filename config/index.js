require('dotenv').config({ quiet: true });
const path = require('path');

module.exports = {
  appName: 'KripikPintar',
  port: process.env.PORT || 3000,
  logDir: path.join(__dirname, '..', 'logs'),
  logFile: 'logger.md',
  uploadDir: path.join(__dirname, '..', 'public', 'uploads'),
  sessionSecret: process.env.SESSION_SECRET || 'kripikpintar-rahasia-dev',
  // Nomor WhatsApp penjual (format internasional tanpa tanda +)
  // Akun pemilik usaha dibuat/diperbarui otomatis dari .env saat server menyala
  pemilik: {
    username: process.env.OWNER_USERNAME,
    password: process.env.OWNER_PASSWORD,
  },
  whatsappNomor: process.env.WA_NOMOR || '6281234567890',
};
