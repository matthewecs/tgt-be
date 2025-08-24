const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET all customers
router.get('/', customerController.getAll);

// GET all customers for dropdown options (id, name, and address only)
router.get('/getAllForDropdownOption', customerController.getAllForDropdownOption);

// GET customer by ID
router.get('/:id', customerController.getById);

// CREATE a new customer
router.post('/', customerController.create);

// UPDATE a customer by ID
router.put('/:id', customerController.update);

// DELETE a customer by ID
router.delete('/:id', customerController.deleteEntity);

module.exports = router;
