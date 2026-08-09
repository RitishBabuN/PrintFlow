const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    bwSinglePageCost: { type: Number, default: 3 },
    bwDoublePageCost: { type: Number, default: 2 },
    colorSinglePageCost: { type: Number, default: 14 },
    colorDoublePageCost: { type: Number, default: 10 },
    maxFileSizeMb: { type: Number, default: 10 },
    maxSlotBookings: { type: Number, default: 5 },
}, { timestamps: true });

// Helper to retrieve existing config or auto-initialize defaults
configSchema.statics.getSettings = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('Config', configSchema);
