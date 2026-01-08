require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const cleanUsers = async () => {
  try {
    await connectDB();
    const User = require('../models/user');
    
    await User.deleteMany({ role: { $ne: 'owner' } });
    console.log('✅ Cleared non-owner users');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanUsers();
