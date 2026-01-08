const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const allowRoles = require('../middlewares/roles');

// CREATE → anyone (member)
router.post('/', userController.createUser);

// READ all → owner + office
router.get('/', auth, allowRoles('owner', 'office'), userController.getUsers);

// READ one → anyone logged in
router.get('/:id', auth, userController.getUserById);

// UPDATE → member updates self, office updates members, owner updates anyone
router.put('/:id', auth, userController.updateUser);

// DELETE → only owner
router.delete('/:id', auth, allowRoles('owner'), userController.deleteUser);

module.exports = router;
