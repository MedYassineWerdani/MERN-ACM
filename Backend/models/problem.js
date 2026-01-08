const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
    trim: true
  },
  output: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  timeLimit: {
    type: Number,
    required: true // in milliseconds
  },
  memoryLimit: {
    type: Number,
    required: true // in MB
  },
  statement: {
    type: String,
    required: true // Problem description
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examples: [exampleSchema],
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Problem', problemSchema);
