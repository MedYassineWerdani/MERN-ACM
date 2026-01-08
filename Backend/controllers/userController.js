const User = require('../models/user');
const OWNER = require('../config/owner');
const { sanitizeUser } = require('../services/sanitizeUser');
const { verifyCodeforcesHandle } = require('../services/codeforcesService');

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { fullName, handle, email, password, role } = req.body;
    if (!fullName || !handle || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Role assignment rules
    if (role && ['office', 'manager'].includes(role)) {
      return res.status(403).json({ message: 'Only owner can assign office or manager roles' });
    }

    // Codeforces handle verification
    const isValid = await verifyCodeforcesHandle(handle);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid Codeforces handle' });
    }

    const user = new User({ fullName, handle, email, password, role: 'member' });
    await user.save();

    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL USERS (owner + office)
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(u => sanitizeUser(u)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE USER
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user ID format' });
    res.status(500).json({ error: err.message });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user; // from auth middleware
    const { fullName, handle, email } = req.body;

    if (!fullName && !handle && !email) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Role-based restrictions
    if (requester.role === 'member' && requester.id !== id) {
      return res.status(403).json({ message: 'Members can only update their own profile' });
    }
    if (requester.role === 'office' && user.role !== 'member') {
      return res.status(403).json({ message: 'Office can only update members' });
    }

    // CF handle validation if updated
    if (handle && !(await verifyCodeforcesHandle(handle))) {
      return res.status(400).json({ message: 'Invalid Codeforces handle' });
    }

    if (fullName) user.fullName = fullName;
    if (handle) user.handle = handle;
    if (email) user.email = email;

    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can delete users' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'owner') return res.status(403).json({ message: 'Cannot delete owner' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
