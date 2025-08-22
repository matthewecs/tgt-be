const express = require('express');
const router = express.Router();
const workFlowController = require('../controllers/workFlowController');

// GET all workflows
router.get('/', workFlowController.getAll);

// GET next available step
router.post('/get-next-available-step', workFlowController.getNextAvailableStep);

// GET workflow by ID
router.get('/:id', workFlowController.getById);

// CREATE a new workflow
router.post('/_create', workFlowController.create);

// UPDATE a workflow by ID
router.put('/:id', workFlowController.update);

// DELETE a workflow by ID
router.delete('/:id', workFlowController.deleteEntity);

module.exports = router;
