const express = require('express');
const homeController = require('../controllers/homeController');
const { wajibLogin, wajibPemilik } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', wajibLogin, homeController.index);
router.get('/produk/baru', wajibPemilik, homeController.formTambah);
router.get('/produk/:id/edit', wajibPemilik, homeController.formUbah);
router.get('/produk/:id/caption', wajibPemilik, homeController.halamanCaption);

module.exports = router;
