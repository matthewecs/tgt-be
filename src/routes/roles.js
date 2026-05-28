const router = require('express').Router();
const ctrl = require('../controllers/roles');
const { authenticate, requirePermission } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.listRoles);
router.put('/:id/permissions', requirePermission('role:manage'), ctrl.setRolePermissions);

module.exports = router;
