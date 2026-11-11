const { wantsJson } = require('../utils/http');

// Menaruh data user yang login agar bisa dipakai di semua view
exports.pasangUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

function tolak(req, res, status, pesan, alihkan) {
  if (wantsJson(req)) return res.status(status).json({ sukses: false, pesan });
  return res.redirect(alihkan);
}

// Harus sudah login (peran apa saja)
exports.wajibLogin = (req, res, next) => {
  if (req.session.user) return next();
  return tolak(req, res, 401, 'Silakan login terlebih dahulu', '/auth/login');
};

// Harus login sebagai pemilik usaha
exports.wajibPemilik = (req, res, next) => {
  if (!req.session.user) return tolak(req, res, 401, 'Silakan login terlebih dahulu', '/auth/login');
  if (req.session.user.role !== 'pemilik') {
    return tolak(req, res, 403, 'Fitur ini hanya untuk pemilik usaha', '/');
  }
  return next();
};
