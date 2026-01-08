const Session = require('../models/session');
const mongoose = require('mongoose');

// Generate a session code (manager/owner only)
const getSessionCode = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    // Role check (middleware should enforce, but double-check)
    if (!['owner', 'manager'].includes(user.role)) {
      return res.status(403).json({ message: 'Only owner/manager can create session codes' });
    }

    // Generate unique 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const session = new Session({
      code,
      date: new Date(),
      presentUsers: [],
      createdBy: user.id
    });

    await session.save();
    
    res.status(201).json({ 
      code, 
      sessionId: session._id,
      createdAt: session.date,
      message: 'Session code generated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark presence
const markPresence = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    const { sessionId, code } = req.body;

    // Validate inputs
    if (!sessionId || !code) {
      return res.status(400).json({ message: 'sessionId and code are required' });
    }

    // Validate sessionId format
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID format' });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check if code matches
    if (session.code !== code) {
      return res.status(401).json({ message: 'Incorrect session code' });
    }

    // Check if user is already marked present
    if (session.presentUsers.includes(user.id)) {
      return res.status(409).json({ message: 'You are already marked present in this session' });
    }

    // Mark user as present
    session.presentUsers.push(user.id);
    await session.save();

    res.json({ 
      message: 'Presence marked successfully',
      sessionId: session._id,
      presentCount: session.presentUsers.length
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid session ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSessionCode, markPresence };
