const express = require('express');
const router = express.Router();
const { getSessionCode, markPresence } = require('../controllers/sessionController');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/roles');

// GET SESSION CODE (owner + manager only)
router.post('/code', auth, allowRoles('owner', 'manager'), getSessionCode);

// MARK PRESENCE (any authenticated user)
router.post('/presence', auth, markPresence);

module.exports = router;
