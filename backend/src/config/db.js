const mongoose = require('mongoose');
const Config = require('../models/Config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/print_queue_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await Config.getSettings();
    console.log('System Configuration initialized');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
