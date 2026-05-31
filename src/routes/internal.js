const router = require('express').Router();
const { authenticate, requirePermission } = require('../middleware/auth');
const c = require('../controllers/company');

router.use(authenticate, requirePermission('company:manage'));

router.post('/ai/suggest', c.aiSuggest);

module.exports = router;
