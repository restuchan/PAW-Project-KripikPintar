const express = require('express');
const authRoutes = require('./auth');
const webRoutes = require('./web');
const apiRoutes = require('./api');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/api', apiRoutes);
router.use('/', webRoutes);

module.exports = router;
