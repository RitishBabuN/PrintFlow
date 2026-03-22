const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect, staff } = require('../middlewares/authMiddleware');
const {
    createPrintJob,
    getQueue,
    getMyJobs,
    acceptJob,
    updateJobStatus
} = require('../controllers/printJobController');

// Student Routes
router.post('/', protect, upload.single('document'), createPrintJob);
router.get('/myjobs', protect, getMyJobs);

// Staff Routes
router.get('/queue', protect, staff, getQueue);
router.put('/:id/accept', protect, staff, acceptJob);
router.put('/:id/status', protect, staff, updateJobStatus);

module.exports = router;
