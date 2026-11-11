const fs = require('fs');
const path = require('path');
const config = require('../config');
const { waktuLokal, waktuIso } = require('../utils/waktu');

const logPath = path.join(config.logDir, config.logFile);

// Siapkan folder dan header tabel Markdown sekali saja saat server menyala
fs.mkdirSync(config.logDir, { recursive: true });
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(
    logPath,
    '# Log Request\n\n' +
      '| Waktu | Method | Path | Status | Durasi | IP |\n' +
      '|---|---|---|---|---|---|\n'
  );
}

// Karakter "|" harus di-escape agar tabel Markdown tidak rusak
const aman = (teks) => String(teks).replace(/\|/g, '%7C');

module.exports = (req, res, next) => {
  const mulai = process.hrtime.bigint();

  // Catat setelah respons selesai supaya status code dan durasi sudah diketahui
  res.on('finish', () => {
    const durasi = (Number(process.hrtime.bigint() - mulai) / 1e6).toFixed(1);

    // 1) Tampil di terminal backend
    console.log(`[${waktuLokal()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durasi} ms)`);

    // 2) Simpan ke logs/logger.md
    const baris =
      `| ${waktuIso()} | ${req.method} | ${aman(req.originalUrl)} ` +
      `| ${res.statusCode} | ${durasi} ms | ${aman(req.ip)} |\n`;

    fs.appendFile(logPath, baris, (err) => {
      if (err) console.error('Gagal menulis log:', err.message);
    });
  });

  next();
};
