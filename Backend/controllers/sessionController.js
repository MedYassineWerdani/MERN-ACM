const Session = require('../models/session');

// Generate a session code (manager/owner only)
const getSessionCode = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    if (!['owner', 'manager'].includes(user.role)) {
      return res.status(403).json({ message: 'Only owner/manager can create session codes' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const session = new Session({
      code,
      createdBy: user.id
    });

    await session.save();
    res.json({ code, sessionId: session._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark presence
const markPresence = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    const { sessionId, code } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.code !== code) {
      return res.status(400).json({ message: 'Incorrect code' });
    }

    if (session.presentUsers.includes(user.id)) {
      return res.status(400).json({ message: 'Already marked present' });
    }

    session.presentUsers.push(user.id);
    await session.save();

    res.json({ message: 'Presence marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSessionCode, markPresence };
