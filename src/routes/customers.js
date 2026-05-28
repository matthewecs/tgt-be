const router = require('express').Router();
const ctrl = require('../controllers/customers');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);
router.use(requirePermission('customer:read'));

router.get('/', ctrl.list);
router.post('/', requirePermission('customer:create'), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', requirePermission('customer:update'), ctrl.update);
router.delete('/:id', requirePermission('customer:delete'), ctrl.remove);
router.get('/:id/offerings', ctrl.getOfferings);

module.exports = router;
