// Pengaman (guardrail) di sisi backend. Jangan hanya mengandalkan system prompt:
// input diperiksa SEBELUM dikirim ke Gemini, dan jawaban diperiksa SETELAH diterima.

// Kode jebakan yang disisipkan di system instruction. Jika muncul di jawaban,
// berarti instruksi sistem bocor dan jawaban tersebut dibuang.
const CANARY = 'KP-CANARY-7f3a91';

const PESAN = {
  injeksi:
    'Maaf, aku tidak bisa mengikuti permintaan itu. Aku hanya membantu menjawab pertanyaan seputar produk KripikPintar, seperti harga, stok, rasa, dan cara memesan.',
  luarTopik:
    'Maaf, pertanyaan itu di luar kemampuanku. Aku hanya bisa membantu seputar produk KripikPintar, misalnya harga, stok, rasa, atau cara memesan. Ada produk yang ingin kamu tanyakan?',
};

// Pola percobaan mengubah peran / mengabaikan aturan (prompt injection)
const POLA_INJEKSI = [
  /\b(abaikan|abaikanlah|hiraukan|lupakan|kesampingkan|ignore|disregard|forget|override|bypass)\b.{0,50}\b(instruksi|aturan|peraturan|perintah|arahan|prompt|batasan|sebelumnya|instruction|instructions|rules|previous|above|guidelines|restrictions?)\b/,
  /\b(system|sistem)\s+(prompt|instruction|instructions|instruksi|message|pesan)\b/,
  /\b(instruksi|prompt|perintah)\s+(sistem|awal|rahasia|tersembunyi|asli)\b/,
  /\b(tampilkan|tunjukkan|perlihatkan|bocorkan|ungkapkan|ulangi|cetak|bacakan|reveal|show|print|repeat|leak|display)\b.{0,40}\b(instruksi|prompt|system|instructions|aturanmu|aturan kamu|aturan anda)\b/,
  /\b(kamu|anda|engkau)\s+(sekarang|kini|mulai sekarang)\s+(adalah|jadi|menjadi|harus)\b/,
  /\b(mulai sekarang|from now on|you are now|kamu bukan lagi|bukan lagi asisten)\b/,
  /\b(berpura pura|pura pura jadi|bayangkan kamu|anggap kamu|anggap saja kamu|berperan sebagai|bertindaklah sebagai|roleplay|role play|pretend|act as|acting as)\b/,
  /\b(jailbreak|dan mode|do anything now|developer mode|mode pengembang|mode developer|mode dewa|admin mode|mode admin)\b/,
  /\b(pesan|perintah|instruksi)\s+(dari|oleh)\s+(sistem|developer|pengembang|admin|pemilik|anthropic|google|openai)\b/,
];

// Pola menyamar sebagai pesan sistem / peran lain, atau menyisipkan blok kode
const POLA_PERAN_PALSU = [
  /(^|\s)(system|assistant|model|developer|sistem)\s*:/,
  /<\/?\s*(system|assistant|instruction|prompt)/,
  /```/,
];

// Permintaan yang jelas di luar ruang lingkup toko
const POLA_LUAR_TOPIK = [
  /\b(buatkan|buat|tuliskan|tulis|bikin|bikinkan|generate|write|create|make|coding)\b.{0,40}\b(kode|program|script|skrip|html|css|javascript|python|java|php|sql|game|aplikasi|website|situs|puisi|cerpen|esai|artikel|lagu|resep|soal|makalah|surat)\b/,
  /\b(selesaikan|kerjakan|jawab|hitung)\b.{0,30}\b(pr|tugas|soal|matematika|skripsi|ujian)\b/,
  /\b(terjemahkan|translate)\b/,
];

// Merapikan input: buang karakter kontrol dan spasi berlebih
exports.bersihkanInput = (teks) =>
  String(teks)
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Mengembalikan 'injeksi', 'luar_topik', atau null (aman)
exports.deteksiPelanggaran = (teks) => {
  const mentah = String(teks).toLowerCase();
  const kata = mentah.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');

  if (POLA_PERAN_PALSU.some((p) => p.test(mentah)) || POLA_INJEKSI.some((p) => p.test(kata))) return 'injeksi';
  if (POLA_LUAR_TOPIK.some((p) => p.test(kata))) return 'luar_topik';
  return null;
};

// Memeriksa dan merapikan jawaban dari Gemini.
// Hasil: { aman: true, teks, hubungiPenjual } atau { aman: false, alasan }
exports.olahBalasan = (teksMentah) => {
  let teks = String(teksMentah || '');
  const hubungiPenjual = /\[HUBUNGI_PENJUAL\]/i.test(teks);
  teks = teks.replace(/\[HUBUNGI_PENJUAL\]/gi, '');

  // Instruksi sistem bocor
  if (teks.includes(CANARY) || /ATURAN WAJIB|RUANG LINGKUP \(hanya/i.test(teks)) return { aman: false, alasan: 'bocor' };
  // Jawaban berisi kode / markup
  if (/```|<\s*\/?\s*(script|html|body|div|span|style|iframe)\b|<\?php/i.test(teks)) return { aman: false, alasan: 'kode' };

  teks = teks
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/`+/g, '')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]*/gm, '')
    .replace(/^[ \t]*[*•][ \t]+/gm, '- ')
    .replace(/\*(\S(?:[^*\n]*\S)?)\*/g, '$1') // miring: *teks* -> teks
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (teks.length > 1200) teks = teks.slice(0, 1200).replace(/\s+\S*$/, '') + '...';
  if (!teks) return { aman: false, alasan: 'kosong' };

  return { aman: true, teks, hubungiPenjual };
};

exports.CANARY = CANARY;
exports.PESAN = PESAN;
