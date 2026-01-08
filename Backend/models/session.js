const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  code: {
    type: String,
    required: true
  },
  presentUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
