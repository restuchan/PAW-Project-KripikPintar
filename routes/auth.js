const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.halamanLogin);
router.get('/register', authController.halamanDaftar);
router.post('/login', authController.masuk);
router.post('/register', authController.daftar);
router.post('/logout', authController.keluar);

module.exports = router;
