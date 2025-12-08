const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  handle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rating: {
    type: Number,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false 
  },
  role: {
    type: String,
    enum: ['owner', 'office', 'manager', 'member'],
    default: 'member'
  }
}, { timestamps: true });

// 🔐 Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if changed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Method to compare passwords (for login later)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;