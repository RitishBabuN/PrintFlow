const Config = require('../models/Config');

// @desc    Get system settings / costs
// @route   GET /api/config
// @access  Public / Private
const getConfig = async (req, res) => {
    try {
        const config = await Config.getSettings();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings / costs
// @route   PUT /api/config
// @access  Private (Admin)
const updateConfig = async (req, res) => {
    try {
        let config = await Config.getSettings();

        const {
            bwSinglePageCost,
            bwDoublePageCost,
            colorSinglePageCost,
            colorDoublePageCost,
            maxFileSizeMb,
            maxSlotBookings
        } = req.body;

        if (bwSinglePageCost !== undefined) config.bwSinglePageCost = Number(bwSinglePageCost);
        if (bwDoublePageCost !== undefined) config.bwDoublePageCost = Number(bwDoublePageCost);
        if (colorSinglePageCost !== undefined) config.colorSinglePageCost = Number(colorSinglePageCost);
        if (colorDoublePageCost !== undefined) config.colorDoublePageCost = Number(colorDoublePageCost);
        if (maxFileSizeMb !== undefined) config.maxFileSizeMb = Number(maxFileSizeMb);
        if (maxSlotBookings !== undefined) config.maxSlotBookings = Number(maxSlotBookings);

        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getConfig, updateConfig };
