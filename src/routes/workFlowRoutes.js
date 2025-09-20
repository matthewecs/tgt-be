const express = require('express');
const router = express.Router();
const workFlowController = require('../controllers/workFlowController');
const { authenticateToken } = require('../controllers/userController');

// GET all workflows
router.get('/', authenticateToken, workFlowController.getAll);

// GET workflows by project ID
router.get('/project/:projectId', authenticateToken, workFlowController.getByProjectId);

// GET next available step
router.post('/get-next-available-step', authenticateToken, workFlowController.getNextAvailableStep);

// GET workflow by ID
router.get('/:id', authenticateToken, workFlowController.getById);

// CREATE a new workflow
router.post('/_create', authenticateToken, workFlowController.create);

// UPDATE a workflow by ID
router.put('/:id', authenticateToken, workFlowController.update);

// DELETE a workflow by ID
router.delete('/:id', authenticateToken, workFlowController.deleteEntity);

module.exports = router;
