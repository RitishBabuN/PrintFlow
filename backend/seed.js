require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Config = require('./src/models/Config');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/print_queue_db');
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const defaultUsers = [
            { name: 'Admin User', email: 'admin@printflow.com', password, role: 'admin' },
            { name: 'Staff User', email: 'staff@printflow.com', password, role: 'staff' },
            { name: 'Student User', email: 'student@printflow.com', password, role: 'student', walletBalance: 100 }
        ];

        // Check for existing users before adding
        for (const userData of defaultUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                await User.create(userData);
                console.log(`Created user: ${userData.email}`);
            } else {
                console.log(`User already exists (skipped): ${userData.email}`);
            }
        }

        // Check for existing system config before adding
        const existingConfig = await Config.findOne();
        if (!existingConfig) {
            await Config.create({
                bwSinglePageCost: 3,
                bwDoublePageCost: 2,
                colorSinglePageCost: 14,
                colorDoublePageCost: 10,
                maxFileSizeMb: 10,
                maxSlotBookings: 5
            });
            console.log('Created default System Config (Page Costs & Limits)');
        } else {
            console.log('System Config already exists in DB (preserved)');
        }

        console.log('\n✅ Database verified & seeded successfully without deleting existing tables/data!');
        console.log('-----------------------------------');
        console.log('Accounts:');
        console.log('1. Admin   -> email: admin@printflow.com   | password: password123');
        console.log('2. Staff   -> email: staff@printflow.com   | password: password123');
        console.log('3. Student -> email: student@printflow.com | password: password123');
        console.log('-----------------------------------\n');
        process.exit();
    } catch (err) {
        console.error('\n❌ MongoDB connection/seeding error!');
        console.error(err.message);
        process.exit(1);
    }
};

seedDatabase();
