const router = require('express').Router();
const ctrl = require('../controllers/roles');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.listRoles);
router.post('/', requirePermission('role:manage'), ctrl.createRole);
router.delete('/:id', requirePermission('role:manage'), ctrl.deleteRole);
router.put('/:id/permissions', requirePermission('role:manage'), ctrl.setRolePermissions);

module.exports = router;
