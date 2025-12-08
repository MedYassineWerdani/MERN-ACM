const User = require('../models/user');
const OWNER = require('../config/owner');

// CREATE
const createUser = async (req, res) => {
  try {
    const { fullName, handle, email, password, role } = req.body;

    // ✅ Required fields check
    if (!fullName || !handle || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ OWNER rule
    if (role === OWNER.role) {
      const existingOwner = await User.findOne({ role: OWNER.role });
      if (existingOwner) {
        return res.status(400).json({ message: 'Owner already exists' });
      }
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ all
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ one
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, handle, email, password, role } = req.body;

    // ✅ At least one field must be provided
    if (!fullName && !handle && !email && !password && !role) {
      return res.status(400).json({ message: 'At least one field must be provided for update' });
    }

    // ✅ OWNER rule
    if (role === OWNER.role) {
      const existingOwner = await User.findOne({ role: OWNER.role });
      if (existingOwner && existingOwner._id.toString() !== id) {
        return res.status(400).json({ message: 'Owner already exists' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Prevent deleting OWNER
    if (user.role === OWNER.role) {
      return res.status(403).json({ message: 'Cannot delete the static OWNER' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ✅ Clean export list at the end
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};