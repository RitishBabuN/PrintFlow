const User = require('../models/User');
const Transaction = require('../models/Transaction');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'student';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
                lockedBalance: user.lockedBalance,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile & wallet
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletBalance: user.walletBalance,
                lockedBalance: user.lockedBalance,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Top up user wallet
// @route   POST /api/users/topup
// @access  Private
const topUpWallet = async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.walletBalance += Number(amount);
            await user.save();

            // Log transaction
            await Transaction.create({
                userId: user._id,
                amount: Number(amount),
                type: 'topup',
                status: 'completed'
            });

            res.json({
                message: 'Top-up successful',
                walletBalance: user.walletBalance,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get total system revenue
// @route   GET /api/users/admin/revenue
// @access  Private (Admin)
const getAdminRevenue = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const transactions = await Transaction.find({ 
            type: 'deduct', 
            status: 'completed',
            createdAt: { $gte: startOfDay }
        });
        const totalRevenue = transactions.reduce((sum, txn) => sum + txn.amount, 0);

        res.json({ totalRevenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refund user wallet
// @route   POST /api/users/refund
// @access  Private
const refundWallet = async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid active amount' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const unlockedBalance = user.walletBalance - user.lockedBalance;
            if (amount > unlockedBalance) {
                return res.status(400).json({ message: 'Insufficient unlocked balance for refund' });
            }

            user.walletBalance -= Number(amount);
            await user.save();

            // Log transaction
            await Transaction.create({
                userId: user._id,
                amount: Number(amount),
                type: 'refund',
                status: 'completed'
            });

            res.json({
                message: 'Refund successful',
                walletBalance: user.walletBalance,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/users/admin/users
// @access  Private (Admin)
const getAdminUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user (Admin)
// @route   DELETE /api/users/admin/users/:id
// @access  Private (Admin)
const deleteAdminUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user (Admin)
// @route   POST /api/users/admin/users
// @access  Private (Admin)
const createAdminUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        const { name, email, password, role, walletBalance } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role: role || 'student', walletBalance: walletBalance || 0
        });

        res.status(201).json({
            _id: user._id, name: user.name, email: user.email, role: user.role, walletBalance: user.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reports (Admin)
// @route   GET /api/users/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
        
        // Fetch absolute print jobs history joined with user
        const PrintJob = require('../models/PrintJob'); // Import here if not at top
        const jobs = await PrintJob.find({}).populate('userId', 'name email role').sort({ createdAt: -1 });
        const transactions = await Transaction.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
        
        res.json({
            jobs,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
