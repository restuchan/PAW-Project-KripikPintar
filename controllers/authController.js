const User = require('../models/userModel');
const { wantsJson, bungkus } = require('../utils/http');

const PERAN = ['pemilik', 'pembeli'];
const NAMA_PERAN = { pemilik: 'Pemilik Usaha', pembeli: 'Pembeli' };

function tampilkan(res, status, aktif, data = {}) {
  return res.status(status).render('auth/index', {
    judul: aktif === 'masuk' ? 'Masuk - KripikPintar' : 'Daftar - KripikPintar',
    aktif,
    error: data.error || null,
    sukses: data.sukses || null,
    old: data.old || {},
  });
}

// GET /auth/login
exports.halamanLogin = (req, res) => {
  if (req.session.user) return res.redirect('/');
  return tampilkan(res, 200, 'masuk', { sukses: req.query.sukses });
};

// GET /auth/register
exports.halamanDaftar = (req, res) => {
  if (req.session.user) return res.redirect('/');
  return tampilkan(res, 200, 'daftar');
};

// POST /auth/register  -> pendaftaran HANYA untuk pembeli.
// Akun pemilik tidak bisa dibuat lewat sini (dibuat sistem dari .env).
exports.daftar = bungkus(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const role = 'pembeli'; // dipaksa di server, apa pun yang dikirim klien
  const json = wantsJson(req);

  const gagal = (status, error) =>
    json ? res.status(status).json({ sukses: false, pesan: error }) : tampilkan(res, status, 'daftar', { error, old: { username } });

  if (!username || !password) return gagal(400, 'Username dan password wajib diisi');
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return gagal(400, 'Username 3-20 karakter: huruf, angka, atau garis bawah');
  if (password.length < 6 || password.length > 72) return gagal(400, 'Password minimal 6 karakter');
  if (await User.cariByUsername(username)) return gagal(409, 'Username sudah dipakai, coba yang lain');

  await User.buat({ username, password, role });

  if (json) return res.status(201).json({ sukses: true, pesan: 'Pendaftaran berhasil, silakan login' });
  return res.redirect('/auth/login?sukses=' + encodeURIComponent('Pendaftaran berhasil. Silakan masuk.'));
});

// POST /auth/login
exports.masuk = bungkus(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const role = String(req.body.role || '');
  const json = wantsJson(req);

  const gagal = (status, error) =>
    json ? res.status(status).json({ sukses: false, pesan: error }) : tampilkan(res, status, 'masuk', { error, old: { username, role } });

  if (!username || !password || !role) return gagal(400, 'Peran, username, dan password wajib diisi');
  if (!PERAN.includes(role)) return gagal(400, 'Peran tidak valid');

  const user = await User.cariByUsername(username);
  if (!user || !(await user.cocokPassword(password))) return gagal(401, 'Username atau password salah');
  if (user.role !== role) {
    return gagal(403, `Akun ini terdaftar sebagai ${NAMA_PERAN[user.role]}. Pilih peran yang sesuai.`);
  }

  // regenerate: membuat session baru agar aman dari session fixation
  req.session.regenerate((err) => {
    if (err) return gagal(500, 'Gagal membuat sesi login');
    req.session.user = { id: user.id, username: user.username, role: user.role };
    if (json) return res.json({ sukses: true, pesan: 'Login berhasil', data: req.session.user });
    return res.redirect('/');
  });
});

// POST /auth/logout
exports.keluar = (req, res) => {
  const json = wantsJson(req);
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    if (json) return res.json({ sukses: true, pesan: 'Logout berhasil' });
    return res.redirect('/auth/login');
  });
};
