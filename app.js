const express = require('express');
const session = require('express-session');
const path = require('path');
const config = require('./config');
const { sequelize, User } = require('./models');
const logger = require('./middlewares/logger');
const { pasangUser } = require('./middlewares/authMiddleware');
const { jalankanSeed } = require('./seeders/seed');
const routes = require('./routes');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // js dan foto upload
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 hari
  })
);
app.use(logger); // dipasang sebelum routes agar semua request tercatat
app.use(pasangUser);

// Routes
app.use('/', routes);

// 404
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ sukses: false, pesan: 'Endpoint tidak ditemukan' });
  }
  res.status(404).send('Halaman tidak ditemukan');
});

// Penanganan error tak terduga
app.use((err, req, res, next) => {
  console.error('Terjadi error:', err.message);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ sukses: false, pesan: 'Terjadi kesalahan pada server' });
  }
  res.status(500).send('Terjadi kesalahan pada server');
});

// Penjelasan ramah untuk kegagalan koneksi database yang umum
function jelaskanError(err) {
  const kode = err.parent && err.parent.code;
  if (kode === '3D000') return 'Database belum dibuat. Buat database bernama "kripikpintar" di pgAdmin.';
  if (kode === '28P01') return 'Password atau username PostgreSQL salah. Periksa DB_USER dan DB_PASS di file .env.';
  if (kode === 'ECONNREFUSED') return 'PostgreSQL belum berjalan atau port-nya salah. Periksa DB_HOST dan DB_PORT di file .env.';
  if (/client password must be a string/i.test(err.message)) return 'DB_PASS belum diisi. Buat file .env dari .env.example.';
  return err.message;
}

async function mulai() {
  try {
    if (!config.pemilik.username || !config.pemilik.password) {
      throw new Error('OWNER_USERNAME dan OWNER_PASSWORD belum diisi di file .env (lihat .env.example)');
    }

    await sequelize.authenticate();
    console.log('Koneksi database berhasil');

    await sequelize.sync(); // membuat tabel jika belum ada
    console.log('Tabel database siap');

    // Database baru (belum ada akun sama sekali) -> nanti diisi data awal
    const databaseBaru = (await User.count()) === 0;

    // Akun pemilik selalu disamakan dengan .env: dibuat jika belum ada,
    // password diperbarui jika berubah, dan akun pemilik lain dihapus
    const status = await User.pastikanPemilik(config.pemilik.username, config.pemilik.password);
    console.log(`Akun pemilik siap: ${config.pemilik.username} (${status})`);

    if (databaseBaru) await jalankanSeed();

    app.listen(config.port, () => {
      console.log(`Server jalan di http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Gagal memulai aplikasi:', jelaskanError(err));
    process.exit(1);
  }
}

mulai();
