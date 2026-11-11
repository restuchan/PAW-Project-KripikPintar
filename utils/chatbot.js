// Chatbot berbasis aturan. Semua jawaban diambil dari data produk di database
// atau dari teks tetap, bukan dikarang.
const formatRupiah = require('./formatRupiah');

const KATA_UMUM = ['kripik', 'malang', 'g', 'gr', 'gram', 'kg'];

const normalisasi = (teks) => ' ' + String(teks).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

// Kata kunci produk, contoh: "Kripik Apel Malang 100 g" -> ["apel"]
function kataKunci(nama) {
  return normalisasi(nama)
    .trim()
    .split(' ')
    .filter((k) => k && !KATA_UMUM.includes(k) && !/^\d+$/.test(k));
}

function cariProduk(pesanNorm, daftarProduk) {
  return daftarProduk.filter((p) => kataKunci(p.nama).some((k) => pesanNorm.includes(` ${k} `)));
}

const ada = (pola, teks) => pola.test(teks);

exports.jawab = (pesan, daftarProduk) => {
  const norm = normalisasi(pesan);
  const cocok = cariProduk(norm, daftarProduk).slice(0, 3);
  const daftar = cocok.length ? cocok : null;

  // 1) Pertanyaan yang jawabannya teks tetap
  if (ada(/ (ongkir|ongkos|kirim|dikirim|pengiriman|ekspedisi|antar|diantar) /, norm)) {
    return { jawaban: 'Ongkos kirim dihitung oleh penjual sesuai alamatmu dan disepakati lewat WhatsApp setelah kamu memesan.', aksiWa: true };
  }
  if (ada(/ (bayar|pembayaran|transfer|cod|qris|rekening) /, norm)) {
    return { jawaban: 'Pembayaran tidak dilakukan di website ini. Cara bayar (transfer, QRIS, atau COD) disepakati langsung dengan penjual lewat WhatsApp.', aksiWa: true };
  }
  if (ada(/ (hubungi|kontak|penjual|admin|whatsapp|wa|telepon|telp) /, norm)) {
    return { jawaban: 'Silakan hubungi penjual langsung lewat WhatsApp ya.', aksiWa: true };
  }
  if (ada(/ (cara|gimana|bagaimana) .*(pesan|beli|order|memesan|membeli)| (memesan|membeli) /, norm)) {
    return {
      jawaban:
        'Cara memesan:\n1. Tekan "+ Keranjang" pada produk yang kamu mau.\n2. Buka keranjang, lalu tekan "Lanjut ke Checkout".\n3. Isi nama dan alamat, lalu tekan "Pesan via WhatsApp".\n4. Penjual akan mengonfirmasi stok, ongkir, dan pembayaran lewat WhatsApp.',
      aksiWa: false,
    };
  }

  // 2) Pertanyaan yang jawabannya dari data produk
  if (ada(/ (stok|stock|ready|tersedia|masih ada|habis|sisa) /, norm)) {
    const sumber = daftar || daftarProduk;
    const baris = sumber.map((p) => `- ${p.nama}: ${p.stok > 0 ? `tersedia ${p.stok} kemasan` : 'stok habis'}`);
    return { jawaban: `Stok saat ini:\n${baris.join('\n')}`, aksiWa: false };
  }
  if (ada(/ (harga|berapa|biaya|price|rp) /, norm)) {
    const sumber = daftar || daftarProduk;
    const baris = sumber.map((p) => `- ${p.nama}: ${formatRupiah(p.harga)}`);
    return { jawaban: `${daftar ? 'Harga produk' : 'Daftar harga'}:\n${baris.join('\n')}\n\nHarga belum termasuk ongkir.`, aksiWa: false };
  }
  if (ada(/ (rasa|enak|manis|gurih|isi|bahan|deskripsi|keunggulan|tentang|ukuran|berat) /, norm)) {
    if (!daftar) {
      return { jawaban: 'Kamu mau tahu rasa produk yang mana? Contoh: "Rasa kripik apel". Produk kami: ' + daftarProduk.map((p) => p.nama).join(', ') + '.', aksiWa: false };
    }
    const baris = daftar.map((p) => `- ${p.nama}: ${p.deskripsi || p.keunggulan || 'Kripik buah renyah.'}${p.keunggulan && p.deskripsi ? ' Keunggulan: ' + p.keunggulan + '.' : ''}`);
    return { jawaban: baris.join('\n'), aksiWa: false };
  }

  // 3) Menyebut produk saja tanpa pertanyaan jelas -> ringkasan
  if (daftar) {
    const baris = daftar.map((p) => `- ${p.nama}: ${formatRupiah(p.harga)}, ${p.stok > 0 ? 'stok ' + p.stok : 'stok habis'}. ${p.deskripsi || p.keunggulan || ''}`.trim());
    return { jawaban: baris.join('\n'), aksiWa: false };
  }

  // 4) Sapaan dan terima kasih
  if (ada(/ (terima kasih|makasih|thanks|thank you) /, norm)) {
    return { jawaban: 'Sama-sama! Kalau ada yang ingin ditanyakan lagi, langsung tanya ya.', aksiWa: false };
  }
  if (ada(/ (halo|hai|hi|hallo|assalamualaikum|pagi|siang|sore|malam) /, norm)) {
    return { jawaban: 'Halo! Aku bisa membantu soal harga, stok, rasa, dan cara memesan kripik. Mau tanya apa?', aksiWa: false };
  }

  // 5) Di luar kemampuan -> arahkan ke penjual
  return {
    jawaban: 'Maaf, aku belum bisa menjawab itu. Kamu bisa tanya soal harga, stok, rasa, atau cara memesan, atau langsung hubungi penjual lewat WhatsApp.',
    aksiWa: true,
  };
};
