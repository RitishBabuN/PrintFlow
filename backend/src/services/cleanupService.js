const fs = require('fs');
const PrintJob = require('../models/PrintJob');
const path = require('path');

const cleanupJobs = async () => {
    try {
        // Find jobs that are Collected, Failed, or Refunded and still have files
        const completedStatuses = ['Collected', 'Failed', 'Refunded'];

        // In a real application, wait 24h. For now, we clean immediately when polled.
        const jobsToCleanup = await PrintJob.find({
            status: { $in: completedStatuses },
            fileUrl: { $ne: null }
        });

        for (const job of jobsToCleanup) {
            if (job.fileUrl) {
                const uploadDir = process.env.UPLOAD_DIR || 'uploads';
                const filePath = path.join(__dirname, '../../', uploadDir, job.fileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Auto-cleanup: Deleted file ${job.fileUrl}`);

                    job.fileUrl = null;
                    await job.save();
                }
            }
        }
    } catch (error) {
        console.error('Cleanup service error:', error);
    }
};

const startCleanupService = () => {
    const intervalMins = parseInt(process.env.CLEANUP_INTERVAL_MINS || '10', 10);
    setInterval(cleanupJobs, intervalMins * 60000);
    console.log(`Auto-cleanup service started (running every ${intervalMins} mins)`);
};

module.exports = startCleanupService;
