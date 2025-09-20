const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../controllers/userController');

// GET all projects
router.get('/', authenticateToken, projectController.getAll);

// GET all projects for dropdown options (id, name only)
router.get('/getAllForDropdownOption', authenticateToken, projectController.getAllForDropdownOption);

// GET project by ID
router.get('/:id', authenticateToken, projectController.getById);

// CREATE a new project
router.post('/', authenticateToken, projectController.create);

// UPDATE a project by ID
router.put('/:id', authenticateToken, projectController.update);

// DELETE a project by ID
router.delete('/:id', authenticateToken, projectController.deleteEntity);

module.exports = router;
