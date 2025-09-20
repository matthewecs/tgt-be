const express = require('express');
const router = express.Router();
const workStepCategoryController = require('../controllers/workStepCategoryController');
const { authenticateToken } = require('../controllers/userController');

// GET all workstep categories
router.get('/', authenticateToken, workStepCategoryController.getAll);

// GET all workstep categories for dropdown options (name and description only)
router.get('/getAllForDropdownOption', authenticateToken, workStepCategoryController.getAllForDropdownOption);

// GET workstep category by ID
router.get('/:id', authenticateToken, workStepCategoryController.getById);

// CREATE a new workstep category
router.post('/', authenticateToken, workStepCategoryController.create);

// UPDATE a workstep category by ID
router.put('/:id', authenticateToken, workStepCategoryController.update);

// DELETE a workstep category by ID
router.delete('/:id', authenticateToken, workStepCategoryController.deleteEntity);

module.exports = router;
