const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', userController.createUser);
router.post('/login', userController.login);

// Protected routes (authentication required)
router.post('/logout', userController.authenticateToken, userController.logout);
router.put('/:id', userController.authenticateToken, userController.updateUser);

module.exports = router;
