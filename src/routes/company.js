const router = require('express').Router();
const { authenticate, requirePermission } = require('../middleware/auth');
const c = require('../controllers/company');

router.use(authenticate, requirePermission('company:manage'));

router.get('/portfolio',        c.listPortfolio);
router.post('/portfolio',       c.createPortfolio);
router.put('/portfolio/:id',    c.updatePortfolio);
router.delete('/portfolio/:id', c.deletePortfolio);

router.get('/faq',        c.listFaq);
router.post('/faq',       c.createFaq);
router.put('/faq/:id',    c.updateFaq);
router.delete('/faq/:id', c.deleteFaq);

router.get('/articles',        c.listArticles);
router.get('/articles/:id',    c.getArticle);
router.post('/articles',       c.createArticle);
router.put('/articles/:id',    c.updateArticle);
router.delete('/articles/:id', c.deleteArticle);

router.post('/ai/suggest', c.aiSuggest);

module.exports = router;
