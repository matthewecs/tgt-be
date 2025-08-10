const express = require("express");
const router = express.Router();
const workStepController = require('../controllers/WorkStepController');

router.get('/', workStepController.getAll);
router.get('/next', workStepController.getAllWorkStepsForNextStep);
router.get('/:id', workStepController.getById);
router.post('/', workStepController.create);
router.put('/:id', workStepController.update);
router.delete('/:id', workStepController.deleteEntity);

module.exports = router;
