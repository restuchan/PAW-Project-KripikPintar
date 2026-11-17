const sendResponse = require('../utils/response');
const { bersihkanInput, deteksiPelanggaran } = require('../utils/promptGuard');

const MAKS_KARAKTER = 300;

// Validasi input chat SEBELUM diteruskan ke controller / Gemini
module.exports = function validateChatInput(req, res, next) {
  const message = req.body && req.body.message;

  if (typeof message !== 'string' || !message.trim()) {
    return sendResponse(res, { code: 400, success: false, message: 'Pesan tidak boleh kosong' });
  }
  if (message.trim().length > MAKS_KARAKTER) {
    return sendResponse(res, {
      code: 400,
      success: false,
      message: `Pesan terlalu panjang, maksimal ${MAKS_KARAKTER} karakter`,
    });
  }

  const bersih = bersihkanInput(message);
  if (!bersih) {
    return sendResponse(res, { code: 400, success: false, message: 'Pesan tidak boleh kosong' });
  }

  // Dibaca oleh controller: pesan yang sudah bersih + hasil pemeriksaan guardrail
  req.chatInput = { message: bersih, pelanggaran: deteksiPelanggaran(bersih) };
  next();
};
