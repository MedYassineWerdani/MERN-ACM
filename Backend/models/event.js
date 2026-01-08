const mongoose = require('mongoose');

// Discussion/Comment schema for forum-like feature
const discussionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['online', 'in-house'],
    default: 'in-house'
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: null
  },
  fees: {
    type: Number,
    default: 0
  },
  paidUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  discussions: [discussionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if event is full
eventSchema.methods.isFull = function () {
  if (!this.maxParticipants) return false;
  return this.registeredUsers.length >= this.maxParticipants;
};

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function (userId) {
  return this.registeredUsers.some(id => id.toString() === userId.toString());
};

// Method to check if user has paid
eventSchema.methods.hasUserPaid = function (userId) {
  return this.paidUsers.some(id => id.toString() === userId.toString());
};

// Method to get available spots
eventSchema.methods.getAvailableSpots = function () {
  if (!this.maxParticipants) return null;
  return Math.max(0, this.maxParticipants - this.registeredUsers.length);
};

// Index for better query performance
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
