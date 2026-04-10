const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    topUpWallet,
    getAdminRevenue,
    refundWallet,
    getAdminUsers,
    deleteAdminUser,
    createAdminUser,
    getAdminReports
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.post('/topup', protect, topUpWallet);
router.post('/refund', protect, refundWallet);

// Admin routes
router.get('/admin/revenue', protect, getAdminRevenue);
router.get('/admin/users', protect, getAdminUsers);
router.post('/admin/users', protect, createAdminUser);
router.delete('/admin/users/:id', protect, deleteAdminUser);
router.get('/admin/reports', protect, getAdminReports);

module.exports = router;
