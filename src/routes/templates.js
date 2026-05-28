const router = require('express').Router();
const ctrl = require('../controllers/templates');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);
router.use(requirePermission('template:read'));

router.get('/', ctrl.list);
router.post('/', requirePermission('template:create'), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', requirePermission('template:update'), ctrl.update);
router.delete('/:id', requirePermission('template:delete'), ctrl.remove);

module.exports = router;
