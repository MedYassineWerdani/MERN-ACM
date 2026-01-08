const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/roles');

// CREATE USER (public signup for members only)
router.post('/', userController.createUser);

// GET ALL USERS (owner + office only)
router.get('/', auth, allowRoles('owner', 'office'), userController.getUsers);

// GET ONE USER (any authenticated user)
router.get('/:id', auth, userController.getUserById);

// UPDATE USER (member updates self, office updates members, owner updates anyone)
router.put('/:id', auth, userController.updateUser);

// DELETE USER (owner only)
router.delete('/:id', auth, allowRoles('owner'), userController.deleteUser);

module.exports = router;