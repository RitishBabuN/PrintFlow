require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Socket.io initialization
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Middleware to inject io into requests if needed
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Basic Route for testing
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running', time: new Date() });
});

// Import and use routes
const userRoutes = require('./src/routes/userRoutes');
const printJobRoutes = require('./src/routes/printJobRoutes');

app.use('/api/users', userRoutes);
app.use('/api/print-jobs', printJobRoutes);

// Start Auto-cleanup Service
const startCleanupService = require('./src/services/cleanupService');
startCleanupService();

// Socket logic
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Custom room joining for user-specific real-time updates
    socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
