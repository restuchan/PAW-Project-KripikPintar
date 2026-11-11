// Mengisi data awal: 1 akun pembeli contoh dan 9 produk kripik.
// Dijalankan otomatis saat database masih kosong, atau manual: npm run seed
const config = require('../config');
const { sequelize, User, Produk } = require('../models');

const produkAwal = [
  { nama: 'Kripik Apel Malang 100 g', deskripsi: 'Irisan apel Malang yang renyah dengan rasa manis alami.', harga: 28000, stok: 40, keunggulan: 'renyah dan manis alami, dari apel Malang', targetPembeli: 'ibu rumah tangga dan pecinta camilan' },
  { nama: 'Kripik Nangka 100 g', deskripsi: 'Nangka matang pilihan, wangi dan manis, enak untuk teman santai.', harga: 30000, stok: 32, keunggulan: 'wangi, manis, dan renyah', targetPembeli: 'pekerja kantoran' },
  { nama: 'Kripik Pisang 150 g', deskripsi: 'Pisang diiris tipis, gurih dan renyah, cocok untuk camilan keluarga.', harga: 18000, stok: 55, keunggulan: 'tipis, gurih, dan renyah', targetPembeli: 'keluarga' },
  { nama: 'Kripik Salak 100 g', deskripsi: 'Salak dengan rasa khas dan tekstur renyah yang berbeda dari kripik biasa.', harga: 26000, stok: 20, keunggulan: 'rasa khas salak dan tekstur renyah', targetPembeli: 'pencari camilan unik' },
  { nama: 'Kripik Jambu Biji 100 g', deskripsi: 'Jambu biji dengan rasa segar dan ringan di lidah.', harga: 24000, stok: 12, keunggulan: 'segar dan ringan', targetPembeli: 'pelajar dan mahasiswa' },
  { nama: 'Kripik Melon 100 g', deskripsi: 'Melon manis lembut, enak dimakan langsung atau jadi hadiah kecil.', harga: 27000, stok: 9, keunggulan: 'manis lembut', targetPembeli: 'pencari oleh-oleh' },
  { nama: 'Kripik Durian 100 g', deskripsi: 'Durian yang diproses menjadi kripik, enak dan gurih.', harga: 30000, stok: 25, keunggulan: 'aroma khas durian, gurih', targetPembeli: 'pecinta durian' },
  { nama: 'Kripik Nanas 150 g', deskripsi: 'Irisan nanas yang renyah, perpaduan manis dan asam yang menyegarkan.', harga: 25000, stok: 75, keunggulan: 'manis asam yang menyegarkan', targetPembeli: 'anak muda' },
  { nama: 'Kripik Mangga 150 g', deskripsi: 'Mangga matang yang manis dan harum, dengan tekstur renyah di setiap gigitan.', harga: 30000, stok: 50, keunggulan: 'manis, harum, dan renyah', targetPembeli: 'keluarga dan pecinta buah' },
];

async function jalankanSeed() {
  // Akun pemilik sudah dibuat dari .env (lihat User.pastikanPemilik di app.js)
  const pemilik = await User.findOne({ where: { role: 'pemilik' } });

  if (!(await User.cariByUsername('pembeli'))) {
    await User.buat({ username: 'pembeli', password: 'pembeli123', role: 'pembeli' });
  }

  if ((await Produk.count()) === 0) {
    await Produk.bulkCreate(produkAwal.map((p) => ({ ...p, kategori: 'Kripik buah', userId: pemilik ? pemilik.id : null })));
    console.log(`Data awal: ${produkAwal.length} produk ditambahkan`);
  } else {
    console.log('Data awal: tabel produk sudah berisi, dilewati');
  }

  console.log('Akun pembeli contoh -> pembeli / pembeli123');
}

module.exports = { jalankanSeed };

// Jika dijalankan langsung (npm run seed)
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      if (!config.pemilik.username || !config.pemilik.password) {
        throw new Error('OWNER_USERNAME dan OWNER_PASSWORD belum diisi di file .env');
      }
      await User.pastikanPemilik(config.pemilik.username, config.pemilik.password);
      await jalankanSeed();
      process.exit(0);
    } catch (err) {
      console.error('Gagal seeding:', err.message);
      process.exit(1);
    }
  })();
}
