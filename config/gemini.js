// Konfigurasi Google Gemini. API key HANYA dibaca di server dari file .env
// dan tidak pernah dikirim ke browser.
require('dotenv').config({ quiet: true });
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;

// Model bawaan: Flash-Lite (kuota gratis harian lebih besar dibanding Flash biasa).
// Bisa diganti lewat .env, contoh: GEMINI_MODEL=gemini-3.8-flash
const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

if (!apiKey) {
  console.warn('PERINGATAN: GEMINI_API_KEY belum diisi di .env, fitur AI Assistant akan menolak permintaan.');
}

const opsiHttp = {
  timeout: Number(process.env.GEMINI_TIMEOUT_MS) || 20000, // batas waktu satu permintaan (ms)
  // Retry bawaan SDK dimatikan: bawaannya 5 percobaan dengan jeda hingga 60 detik dan ikut
  // mengulang permintaan yang timeout, sehingga pembeli bisa menunggu sangat lama.
  // Percobaan ulang khusus error 503 dilakukan manual di services/gemini.service.js.
  retryOptions: { attempts: 1 },
};
// Hanya untuk pengujian lokal dengan server tiruan (tidak perlu diisi di penggunaan normal)
if (process.env.GEMINI_BASE_URL) opsiHttp.baseUrl = process.env.GEMINI_BASE_URL;

const client = apiKey ? new GoogleGenAI({ apiKey, httpOptions: opsiHttp }) : null;

module.exports = {
  client,
  modelName,
  pengaturan: {
    temperature: 0.3, // rendah agar jawaban konsisten dan tidak mengarang
    maxOutputTokens: 1024,
  },
};
