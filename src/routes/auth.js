const router = require('express').Router();
const ctrl = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.put('/me/password', authenticate, ctrl.changePassword);

module.exports = router;
