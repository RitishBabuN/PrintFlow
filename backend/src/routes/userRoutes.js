const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    topUpWallet,
    getAdminRevenue
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.post('/topup', protect, topUpWallet);

// Admin routes
router.get('/admin/revenue', protect, getAdminRevenue);

module.exports = router;
