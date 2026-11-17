const express = require('express');
const chatController = require('../controllers/chatController');
const validateChatInput = require('../middlewares/validateChatInput');
const rateLimitChat = require('../middlewares/rateLimitChat');
const sendResponse = require('../utils/response');

const router = express.Router();

// Wajib login agar kuota Gemini tidak disalahgunakan orang asing.
// Responsnya memakai format yang sama dengan endpoint chat lainnya.
function wajibLoginChat(req, res, next) {
  if (req.session.user) return next();
  return sendResponse(res, { code: 401, success: false, message: 'Sesi berakhir. Silakan login kembali.' });
}

// POST /api/chat  { "message": "..." }
router.post('/', wajibLoginChat, rateLimitChat, validateChatInput, chatController.chat);
router.post('/reset', wajibLoginChat, chatController.reset);

module.exports = router;
