// Fungsi bantu untuk request/response

// Apakah klien meminta JSON (API, Postman, atau fetch)?
exports.wantsJson = (req) =>
  req.originalUrl.startsWith('/api') ||
  Boolean(req.is('application/json')) ||
  (req.get('accept') || '').includes('application/json');

// Membungkus handler async agar error otomatis diteruskan ke penanganan error Express
exports.bungkus = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Memastikan id berupa bilangan bulat positif, kalau tidak hasilnya null
exports.idValid = (nilai) => {
  const n = Number(nilai);
  return Number.isInteger(n) && n > 0 ? n : null;
};
