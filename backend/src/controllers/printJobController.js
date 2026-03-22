const PrintJob = require('../models/PrintJob');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Printer = require('../models/Printer');
const fs = require('fs');

const PRICE_PER_PAGE = 2; // 2 Rupees per page

// @desc    Upload a new print job
// @route   POST /api/print-jobs
// @access  Private (Student)
const createPrintJob = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { color, doubleSided, copies, pageRange, isInstant, scheduledTime } = req.body;

        // Force all documents to use exactly the same size-based calculation shown in the frontend estimation
        const pages = Math.max(1, Math.ceil(req.file.size / 50000));

        const calculatedCopies = copies ? parseInt(copies) : 1;
        const isColor = color === 'true' || color === true;
        const isDouble = doubleSided === 'true' || doubleSided === true;
        const jobIsInstant = isInstant === 'true' || isInstant === true;

        let pageCost = 0;
        if (isColor) {
            pageCost = isDouble ? 10 : 14;
        } else {
            pageCost = isDouble ? 2 : 3;
        }

        const totalCost = pages * calculatedCopies * pageCost;

        if (!jobIsInstant && scheduledTime) {
            const schedTime = new Date(scheduledTime);
            const now = new Date();
            
            // Check today bounds (10 AM to 8 PM)
            const minTime = new Date(); minTime.setHours(10, 0, 0, 0);
            const maxTime = new Date(); maxTime.setHours(20, 0, 0, 0);
            
            if (schedTime.getDate() !== now.getDate() || schedTime.getMonth() !== now.getMonth() || schedTime.getFullYear() !== now.getFullYear() || schedTime < minTime || schedTime > maxTime) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Schedule must be today between 10:00 AM and 08:00 PM.' });
            }

            // Anti-crowding check (max 5 per +- 15 minute slot window)
            const windowStart = new Date(schedTime.getTime() - 15 * 60000);
            const windowEnd = new Date(schedTime.getTime() + 15 * 60000);
            const slotCount = await PrintJob.countDocuments({
                scheduledTime: { $gte: windowStart, $lte: windowEnd },
                status: { $in: ['Submitted', 'In Queue', 'Accepted'] }
            });

            if (slotCount >= 5) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Time slot is full (max 5 bookings). Please select a different time.' });
            }
        }

        const user = await User.findById(req.user._id);
        const availableBalance = user.walletBalance - user.lockedBalance;

        if (availableBalance < totalCost) {
            if (req.file) fs.unlinkSync(req.file.path); // Delete file if insufficient balance
            return res.status(400).json({ message: 'Insufficient wallet balance.' });
        }

        // Pre-authorize: Lock the amount
        user.lockedBalance += totalCost;
        await user.save();

        // Get queue position length (all currently queued jobs)
        const queueLength = await PrintJob.countDocuments({ status: { $in: ['Submitted', 'In Queue'] } });

        const printJob = await PrintJob.create({
            userId: req.user._id,
            fileUrl: req.file.filename,
            fileName: req.file.originalname,
            pages,
            status: 'Submitted',
            printConfig: {
                color: isColor,
                doubleSided: doubleSided === 'true' || doubleSided === true,
                copies: calculatedCopies,
                pageRange: pageRange || 'all'
            },
            isInstant: jobIsInstant,
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            queuePosition: queueLength + 1,
            lockedAmount: totalCost,
            qrToken: Math.random().toString(36).substring(2, 10).toUpperCase() // Simple QR auth string
        });

        // Notify ALL via socket
        req.io.emit('queueUpdated', { action: 'NEW_JOB', job: printJob });

        res.status(201).json(printJob);

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active queued jobs
// @route   GET /api/print-jobs/queue
// @access  Private (Staff)
const getQueue = async (req, res) => {
    try {
        const jobs = await PrintJob.find({ status: { $in: ['Submitted', 'In Queue', 'Printing', 'Accepted'] } })
            .populate('userId', 'name email')
            .sort({ createdAt: 1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's jobs
// @route   GET /api/print-jobs/myjobs
// @access  Private (Student)
const getMyJobs = async (req, res) => {
    try {
        const jobs = await PrintJob.find({ userId: req.user._id }).sort({ createdAt: -1 });

        // Estimate wait time based on total pages in queue ahead
        const queuedJobs = await PrintJob.find({ status: { $in: ['Submitted', 'In Queue'] } });
        const totalPagesInQueue = queuedJobs.reduce((sum, job) => sum + (job.pages * job.printConfig.copies), 0);
        const waitTimeMins = Math.ceil(totalPagesInQueue * 0.1) || 0; // Rough estimate: 0.1 mins per page

        res.json({ jobs, estimatedWaitMins: waitTimeMins, queueLength: queuedJobs.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a job (Staff)
// @route   PUT /api/print-jobs/:id/accept
// @access  Private (Staff)
const acceptJob = async (req, res) => {
    try {
        const job = await PrintJob.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Only accept if it's submitted or in queue
        if (job.status !== 'Submitted' && job.status !== 'In Queue') {
            return res.status(400).json({ message: 'Job cannot be accepted' });
        }

        job.status = 'Accepted';
        await job.save();

        // Deduct locked amount permanently
        const user = await User.findById(job.userId);
        user.lockedBalance -= job.lockedAmount;
        user.walletBalance -= job.lockedAmount;
        await user.save();

        await Transaction.create({
            userId: user._id,
            jobId: job._id,
            amount: job.lockedAmount,
            type: 'deduct',
            status: 'completed'
        });

        req.io.emit('queueUpdated', { action: 'JOB_UPDATED', job });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update job status (Printing, Ready for Collection, Collected, Failed)
// @route   PUT /api/print-jobs/:id/status
// @access  Private (Staff)
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const job = await PrintJob.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const prevStatus = job.status;
        job.status = status;
        await job.save();

        // If failed, refund the amount
        if (status === 'Failed' && prevStatus !== 'Failed') {
            const user = await User.findById(job.userId);

            if (['Accepted', 'Printing', 'Ready for Collection'].includes(prevStatus)) {
                user.walletBalance += job.lockedAmount;
            } else {
                user.lockedBalance -= job.lockedAmount;
            }
            await user.save();

            await Transaction.create({
                userId: user._id,
                jobId: job._id,
                amount: job.lockedAmount,
                type: 'refund',
                status: 'completed'
            });
        }

        req.io.emit('queueUpdated', { action: 'JOB_UPDATED', job });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPrintJob,
    getQueue,
    getMyJobs,
    acceptJob,
    updateJobStatus
};
