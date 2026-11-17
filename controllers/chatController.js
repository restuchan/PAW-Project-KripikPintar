// Controller hanya menerima request dan mengembalikan response.
// Logika Gemini ada di services/gemini.service.js
const { tanyaGemini, jawabCadangan, GeminiError } = require('../services/gemini.service');
const sendResponse = require('../utils/response');
const { PESAN } = require('../utils/promptGuard');
const { bungkus } = require('../utils/http');

const MAKS_RIWAYAT = 6; // 3 pasang tanya-jawab terakhir, disimpan di session (tidak bisa dipalsukan klien)
const PAKAI_CADANGAN = (process.env.CHAT_FALLBACK || 'on').toLowerCase() !== 'off';

function simpanRiwayat(req, pesan, balasan) {
  const riwayat = req.session.chatRiwayat || [];
  riwayat.push({ role: 'user', teks: pesan }, { role: 'model', teks: balasan });
  req.session.chatRiwayat = riwayat.slice(-MAKS_RIWAYAT);
}

// POST /api/chat
exports.chat = bungkus(async (req, res) => {
  const { message, pelanggaran } = req.chatInput;

  // Lapis 1: guardrail backend, pesan bermasalah tidak dikirim ke Gemini
  if (pelanggaran) {
    const reply = pelanggaran === 'injeksi' ? PESAN.injeksi : PESAN.luarTopik;
    console.warn(`Chat dibatasi (${pelanggaran}) dari user ${req.session.user.username}`);
    return sendResponse(res, {
      message: 'Permintaan dibatasi',
      data: { reply, hubungiPenjual: false, sumber: 'penjaga' },
    });
  }

  // Lapis 2: Gemini dengan system instruction
  try {
    const hasil = await tanyaGemini(message, req.session.chatRiwayat || []);
    if (hasil.sumber === 'gemini') simpanRiwayat(req, message, hasil.reply);
    return sendResponse(res, { message: 'Berhasil dapat balasan', data: hasil });
  } catch (err) {
    if (!(err instanceof GeminiError)) throw err;
    console.error(`Gemini error [${err.kode}]${err.detail ? ': ' + err.detail : ''}`);

    // Gemini sibuk / kuota habis: pakai jawaban cadangan dari data produk
    if (PAKAI_CADANGAN && err.bisaCadangan) {
      const hasil = await jawabCadangan(message);
      return sendResponse(res, { message: 'AI sedang sibuk, memakai jawaban cadangan', data: hasil });
    }
    return sendResponse(res, { code: err.status, success: false, message: err.pesanPengguna });
  }
});

// POST /api/chat/reset  -> mulai percakapan baru
exports.reset = (req, res) => {
  req.session.chatRiwayat = [];
  return sendResponse(res, { message: 'Percakapan direset' });
};
