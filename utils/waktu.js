// Fungsi bantu untuk menulis waktu pada log

// Waktu lokal WIB untuk tampilan di terminal, contoh: "29/10/2026, 14:05:12"
exports.waktuLokal = (tanggal = new Date()) =>
  tanggal.toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false });

// Format ISO untuk disimpan di file log
exports.waktuIso = (tanggal = new Date()) => tanggal.toISOString();
