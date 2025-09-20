const express = require("express");
const router = express.Router();
const workStepController = require('../controllers/WorkStepController');
const { authenticateToken } = require('../controllers/userController');

router.get('/', authenticateToken, workStepController.getAll);
router.get('/next', authenticateToken, workStepController.getAllWorkStepsForNextStep);
router.get('/:id', authenticateToken, workStepController.getById);
router.post('/', authenticateToken, workStepController.create);
router.put('/:id', authenticateToken, workStepController.update);
router.delete('/:id', authenticateToken, workStepController.deleteEntity);

module.exports = router;
