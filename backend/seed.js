require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/print_queue_db');
        console.log('Connected to MongoDB');

        // Clear existing users to prevent duplicates
        await User.deleteMany({});
        console.log('Cleared existing users');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        await User.create([
            { name: 'Admin User', email: 'admin@printflow.com', password, role: 'admin' },
            { name: 'Staff User', email: 'staff@printflow.com', password, role: 'staff' },
            { name: 'Student User', email: 'student@printflow.com', password, role: 'student', walletBalance: 100 }
        ]);

        console.log('\n✅ Database seeded successfully!');
        console.log('-----------------------------------');
        console.log('You can now log in with these accounts:');
        console.log('1. Admin   -> email: admin@printflow.com   | password: password123');
        console.log('2. Staff   -> email: staff@printflow.com   | password: password123');
        console.log('3. Student -> email: student@printflow.com | password: password123');
        console.log('-----------------------------------\n');
        process.exit();
    } catch (err) {
        console.error('\n❌ MongoDB connection error!');
        console.error('Please ensure your local MongoDB service is actively running on port 27017 before running this script.');
        console.error(err.message);
        process.exit(1);
    }
};

seedDatabase();
