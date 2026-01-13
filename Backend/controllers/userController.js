const User = require('../models/user');
const Event = require('../models/event');
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

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { handle }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or handle already registered' });
    }

    // Role assignment rules: only members can self-register
    // Owner/office/manager roles cannot be self-assigned
    if (role && role !== 'member') {
      return res.status(403).json({ message: 'Only owner can assign office/manager roles. Members self-register as member.' });
    }

    // Codeforces handle verification for non-test accounts
    if (handle !== 'root') { // skip for default owner account
      const isValid = await verifyCodeforcesHandle(handle);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid Codeforces handle' });
      }
    }

    const user = new User({ fullName, handle, email, password, role: 'member' });
    await user.save();

    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists` });
    }
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

    // Cannot update owner profile (except owner updating themselves)
    if (user.role === 'owner' && requester.role !== 'owner') {
      return res.status(403).json({ message: 'Cannot update owner profile' });
    }

    // Role-based restrictions
    if (requester.role === 'member' && requester.id !== id.toString()) {
      return res.status(403).json({ message: 'Members can only update their own profile' });
    }
    if (requester.role === 'office' && user.role !== 'member') {
      return res.status(403).json({ message: 'Office can only update members' });
    }

    // Validate Codeforces handle if being updated
    if (handle && handle !== user.handle) {
      const isValid = await verifyCodeforcesHandle(handle);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid Codeforces handle' });
      }
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (handle) user.handle = handle;
    if (email) user.email = email;

    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists` });
    }
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user ID format' });
    res.status(500).json({ error: err.message });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    // Double-check owner role (role middleware should already enforce)
    if (requester.role !== 'owner') {
      return res.status(403).json({ message: 'Only owner can delete users' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deletion of owner
    if (user.role === 'owner') {
      return res.status(403).json({ message: 'Cannot delete owner account' });
    }

    // Prevent owner from deleting themselves by ID
    if (requester.id === id.toString()) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user ID format' });
    res.status(500).json({ error: err.message });
  }
};

// GET MEMBERS WITH ATTENDANCE COUNT (for office dashboard)
const getMembersWithAttendance = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password');
    
    // Get all events and count attendance for each member
    const events = await Event.find().populate('attendedUsers');
    
    const membersWithAttendance = members.map(member => {
      const attendanceCount = events.reduce((count, event) => {
        return count + (event.hasUserAttended(member._id) ? 1 : 0);
      }, 0);
      
      return {
        ...member.toObject(),
        attendanceCount
      };
    });

    // Sort by attendance count descending
    membersWithAttendance.sort((a, b) => b.attendanceCount - a.attendanceCount);

    res.json({
      data: membersWithAttendance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MANAGERS WITH ATTENDANCE COUNT (for office dashboard)
const getManagersWithAttendance = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('-password');
    
    // Get all events and count attendance for each manager
    const events = await Event.find().populate('attendedUsers');
    
    const managersWithAttendance = managers.map(manager => {
      const attendanceCount = events.reduce((count, event) => {
        return count + (event.hasUserAttended(manager._id) ? 1 : 0);
      }, 0);
      
      return {
        ...manager.toObject(),
        attendanceCount
      };
    });

    // Sort by attendance count descending
    managersWithAttendance.sort((a, b) => b.attendanceCount - a.attendanceCount);

    res.json({
      data: managersWithAttendance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser, getMembersWithAttendance, getManagersWithAttendance };
