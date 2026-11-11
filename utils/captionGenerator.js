// Pembuat caption lokal berbasis template.
// Nanti fungsi buatCaption() ini bisa diganti pemanggilan API AI
// tanpa mengubah controller maupun tampilan.
const formatRupiah = require('./formatRupiah');

// "Kripik Apel Malang 100 g" -> "#KripikApelMalang"
function hashtagNama(nama) {
  const kata = nama
    .replace(/\d+\s?(g|gr|gram|kg)\b/gi, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase());
  return kata.length ? '#' + kata.join('') : '';
}

const bersihAkhir = (teks) => String(teks).trim().replace(/[.!,;\s]+$/, '');

function bahan(produk) {
  const keunggulan = produk.keunggulan ? bersihAkhir(produk.keunggulan) : '';
  const target = produk.targetPembeli ? bersihAkhir(produk.targetPembeli) : '';
  return {
    nama: produk.nama,
    harga: formatRupiah(produk.harga),
    kelebihan: keunggulan
      ? `Keunggulannya: ${keunggulan}.`
      : produk.deskripsi
        ? bersihAkhir(produk.deskripsi) + '.'
        : 'Renyah di setiap gigitan.',
    cocok: target ? `Cocok untuk ${target}.` : 'Cocok jadi teman santai di rumah maupun di jalan.',
    tagar: ['#KripikBuah', '#KripikMalang', '#UMKMMalang', hashtagNama(produk.nama)]
      .filter(Boolean)
      .join(' '),
  };
}

const templat = [
  (b) =>
    `🍃 Camilan renyah dari kebun Malang!\n\n${b.nama} hadir untukmu. ${b.kelebihan}\n${b.cocok}\n\n💰 Hanya ${b.harga}\n📦 Pesan sekarang sebelum kehabisan!\n\n${b.tagar}`,
  (b) =>
    `Lagi cari camilan yang bikin nagih? 🤤\n\nCoba ${b.nama}! ${b.kelebihan} ${b.cocok}\n\nHarganya cuma ${b.harga}. Yuk pesan lewat WhatsApp sekarang!\n\n${b.tagar}`,
  (b) =>
    `✨ ${b.nama} ✨\n\n${b.kelebihan} ${b.cocok}\nHarga ${b.harga}. Stok terbatas, yuk amankan bagianmu hari ini!\n\n${b.tagar}`,
  (b) =>
    `Dibuat dari buah pilihan khas Malang dan diolah dengan sepenuh hati. 🍎\n\n${b.nama}\n${b.kelebihan} ${b.cocok}\nSatu kemasan cuma ${b.harga}, pas untuk teman ngopi atau oleh-oleh.\n\nYuk pesan lewat WhatsApp! 📲\n\n${b.tagar}`,
];

// hindari = nomor variasi terakhir, supaya "Buat Ulang" selalu menghasilkan caption berbeda
exports.buatCaption = (produk, hindari) => {
  let variasi = Math.floor(Math.random() * templat.length);
  if (Number.isInteger(hindari) && variasi === hindari) variasi = (variasi + 1) % templat.length;
  return { teks: templat[variasi](bahan(produk)), variasi };
};
