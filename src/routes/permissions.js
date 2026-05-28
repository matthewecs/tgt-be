const router = require('express').Router();
const ctrl = require('../controllers/roles');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.listPermissions);

module.exports = router;
