const mongoose = require('mongoose');

const printerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['available', 'down', 'maintenance'],
        default: 'available'
    },
    health: {
        inkLow: { type: Boolean, default: false },
        paperLow: { type: Boolean, default: false }
    },
    currentJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrintJob', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Printer', printerSchema);
