const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('../config');

fs.mkdirSync(config.uploadDir, { recursive: true });

const penyimpanan = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage: penyimpanan,
  limits: { fileSize: 2 * 1024 * 1024 }, // maksimal 2 MB
  fileFilter: (req, file, cb) => {
    const boleh = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (boleh.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Foto harus berformat JPG, PNG, WEBP, atau GIF'));
  },
});

// Dipakai di route: menerima satu file dengan nama field "foto"
exports.unggahFoto = (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    if (!err) return next();
    const pesan = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran foto maksimal 2 MB' : err.message;
    return res.status(400).json({ sukses: false, pesan });
  });
};
