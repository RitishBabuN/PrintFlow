const mongoose = require('mongoose');

const printJobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    pages: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Submitted', 'In Queue', 'Accepted', 'Printing', 'Ready for Collection', 'Collected', 'Failed', 'Refunded'],
        default: 'Submitted'
    },
    printConfig: {
        color: { type: Boolean, default: false },
        doubleSided: { type: Boolean, default: false },
        copies: { type: Number, default: 1 },
        pageRange: { type: String, default: 'all' }
    },
    isInstant: { type: Boolean, default: true },
    scheduledTime: { type: Date, default: null },
    queuePosition: { type: Number, default: null },
    lockedAmount: { type: Number, required: true },
    printerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Printer', default: null },
    qrToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PrintJob', printJobSchema);
