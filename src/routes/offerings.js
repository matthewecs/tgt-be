const router = require('express').Router();
const ctrl = require('../controllers/offerings');
const payCtrl = require('../controllers/payments');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

// Offerings CRUD
router.get('/', ctrl.list);
router.post('/', requirePermission('offering:create'), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', requirePermission('offering:update'), ctrl.update);

// Workflow actions
router.post('/:id/submit', requirePermission('offering:submit'), ctrl.submit);
router.post('/:id/approve', requirePermission('offering:approve'), ctrl.approve);
router.post('/:id/reject', requirePermission('offering:reject'), ctrl.reject);
router.post('/:id/revision', requirePermission('offering:reject'), ctrl.revision);
router.patch('/:id/status', requirePermission('offering:status_update'), ctrl.updateStatus);
router.post('/:id/item-comment', requirePermission('offering:comment'), ctrl.itemComment);

// PDF & Logs
router.get('/:id/pdf', requirePermission('offering:pdf'), ctrl.getPDF);
router.get('/:id/logs', ctrl.getLogs);

// Payments
router.get('/:id/payments', requirePermission('payment:manage'), payCtrl.list);
router.post('/:id/payments', requirePermission('payment:manage'), payCtrl.create);
router.put('/:id/payments/:pid', requirePermission('payment:manage'), payCtrl.update);
router.delete('/:id/payments/:pid', requirePermission('payment:manage'), payCtrl.remove);

module.exports = router;
