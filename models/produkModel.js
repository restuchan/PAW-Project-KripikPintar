// Data masih hardcode. Nanti bagian ini diganti query database,
// sementara controller dan route tidak perlu diubah.
const daftarProduk = [
  {
    id: 1,
    nama: 'Kripik Apel Malang 100 g',
    kategori: 'Kripik buah',
    deskripsi: 'Irisan apel Malang yang renyah dengan rasa manis alami.',
    harga: 28000,
    stok: 40,
  },
  {
    id: 2,
    nama: 'Kripik Nangka 100 g',
    kategori: 'Kripik buah',
    deskripsi: 'Nangka matang pilihan, wangi dan manis, enak untuk teman santai.',
    harga: 30000,
    stok: 32,
  },
  {
    id: 3,
    nama: 'Kripik Pisang 150 g',
    kategori: 'Kripik buah',
    deskripsi: 'Pisang diiris tipis, gurih dan renyah, cocok untuk camilan keluarga.',
    harga: 18000,
    stok: 55,
  },
  {
    id: 4,
    nama: 'Kripik Salak 100 g',
    kategori: 'Kripik buah',
    deskripsi: 'Salak dengan rasa khas dan tekstur renyah yang berbeda dari kripik biasa.',
    harga: 26000,
    stok: 20,
  },
  {
    id: 5,
    nama: 'Kripik Jambu Biji 100 g',
    kategori: 'Kripik buah',
    deskripsi: 'Jambu biji dengan rasa segar dan ringan di lidah.',
    harga: 24000,
    stok: 12,
  },
  {
    id: 6,
    nama: 'Kripik Melon 100 g',
    kategori: 'Kripik buah',
    deskripsi: 'Melon manis lembut, enak dimakan langsung atau jadi hadiah kecil.',
    harga: 27000,
    stok: 9,
  },
];

const ProdukModel = {
  getAll() {
    return daftarProduk;
  },
};

module.exports = ProdukModel;
