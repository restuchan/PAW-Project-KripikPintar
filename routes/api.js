const express = require('express');
const apiController = require('../controllers/apiController');
const produkController = require('../controllers/produkController');
const captionController = require('../controllers/captionController');
const chatbotController = require('../controllers/chatbotController');
const { wajibLogin, wajibPemilik } = require('../middlewares/authMiddleware');
const { unggahFoto } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/status', apiController.status);

// CRUD produk (membaca terbuka, mengubah data khusus pemilik)
router.get('/produk', produkController.daftar);
router.get('/produk/:id', produkController.detail);
router.post('/produk', wajibPemilik, unggahFoto, produkController.tambah);
router.put('/produk/:id', wajibPemilik, unggahFoto, produkController.ubah);
router.delete('/produk/:id', wajibPemilik, produkController.hapus);

// Caption AI (khusus pemilik)
router.post('/produk/:id/caption/generate', wajibPemilik, captionController.generate);
router.get('/produk/:id/caption', wajibPemilik, captionController.riwayat);
router.post('/produk/:id/caption', wajibPemilik, captionController.simpan);

// Chatbot (pembeli yang sudah login)
router.post('/chatbot', wajibLogin, chatbotController.jawab);

module.exports = router;
