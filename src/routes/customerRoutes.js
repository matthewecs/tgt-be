const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../controllers/userController');

// GET all customers
router.get('/', authenticateToken, customerController.getAll);

// GET all customers for dropdown options (id, name, and address only)
router.get('/getAllForDropdownOption', authenticateToken, customerController.getAllForDropdownOption);

// GET customer by ID
router.get('/:id', authenticateToken, customerController.getById);

// CREATE a new customer
router.post('/', authenticateToken, customerController.create);

// UPDATE a customer by ID
router.put('/:id', authenticateToken, customerController.update);

// DELETE a customer by ID
router.delete('/:id', authenticateToken, customerController.deleteEntity);

module.exports = router;
