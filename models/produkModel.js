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
  {
    id: 7,
    nama: 'Kripik Durian 100 g',
    kategori: 'Kripik buah',
    deskripsi: 'Durian yang diproses menjadi kripik, enak dan gurih.',
    harga: 30000,
    stok: 25,
  },
  {
    id: 8,
    nama: 'Kripik Nanas 150 g',
    kategori: 'Kripik buah',
    deskripsi: 'Irisan nanas yang renyah, perpaduan manis dan asam yang menyegarkan.',
    harga: 25000,
    stok: 75,
  },
  {
    id: 9,
    nama: 'Kripik Mangga 150 g',
    kategori: 'Kripik buah',
    deskripsi: 'Mangga matang yang manis dan harum, dengan tekstur renyah di setiap gigitan.',
    harga: 30000,
    stok: 50,
  },
];

const ProdukModel = {
  getAll() {
    return daftarProduk;
  },
};

module.exports = ProdukModel;
