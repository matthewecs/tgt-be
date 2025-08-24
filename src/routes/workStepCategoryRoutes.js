const express = require('express');
const router = express.Router();
const workStepCategoryController = require('../controllers/workStepCategoryController');

// GET all workstep categories
router.get('/', workStepCategoryController.getAll);

// GET all workstep categories for dropdown options (name and description only)
router.get('/getAllForDropdownOption', workStepCategoryController.getAllForDropdownOption);

// GET workstep category by ID
router.get('/:id', workStepCategoryController.getById);

// CREATE a new workstep category
router.post('/', workStepCategoryController.create);

// UPDATE a workstep category by ID
router.put('/:id', workStepCategoryController.update);

// DELETE a workstep category by ID
router.delete('/:id', workStepCategoryController.deleteEntity);

module.exports = router;
