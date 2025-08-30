const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET all projects
router.get('/', projectController.getAll);

// GET all projects for dropdown options (id, name only)
router.get('/getAllForDropdownOption', projectController.getAllForDropdownOption);

// GET project by ID
router.get('/:id', projectController.getById);

// CREATE a new project
router.post('/', projectController.create);

// UPDATE a project by ID
router.put('/:id', projectController.update);

// DELETE a project by ID
router.delete('/:id', projectController.deleteEntity);

module.exports = router;
