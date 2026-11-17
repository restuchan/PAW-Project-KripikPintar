// Pembatas sederhana: maksimal 10 pesan per menit per pengguna.
// Melindungi kuota Gemini (versi gratis terbatas) dari penggunaan berlebihan.
const sendResponse = require('../utils/response');

const JENDELA_MS = 60 * 1000;
const BATAS = Number(process.env.CHAT_BATAS_PER_MENIT) || 10;
const catatan = new Map(); // kunci pengguna -> daftar waktu request

setInterval(() => {
  const batas = Date.now() - JENDELA_MS;
  for (const [kunci, waktu] of catatan) {
    const sisa = waktu.filter((t) => t > batas);
    if (sisa.length) catatan.set(kunci, sisa);
    else catatan.delete(kunci);
  }
}, JENDELA_MS).unref();

module.exports = function rateLimitChat(req, res, next) {
  const kunci = req.session.user ? `user-${req.session.user.id}` : `ip-${req.ip}`;
  const sekarang = Date.now();
  const daftar = (catatan.get(kunci) || []).filter((t) => sekarang - t < JENDELA_MS);

  if (daftar.length >= BATAS) {
    res.set('Retry-After', String(Math.ceil((JENDELA_MS - (sekarang - daftar[0])) / 1000)));
    return sendResponse(res, { code: 429, success: false, message: 'Terlalu banyak pesan. Tunggu sebentar lalu coba lagi.' });
  }

  daftar.push(sekarang);
  catatan.set(kunci, daftar);
  next();
};
