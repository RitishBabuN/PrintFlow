const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getConfig)
    .put(protect, admin, updateConfig);

module.exports = router;
