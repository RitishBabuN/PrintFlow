const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrintJob', default: null },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ['topup', 'lock', 'deduct', 'refund'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
