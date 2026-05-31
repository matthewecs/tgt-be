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

router.get('/gallery-items',        c.listGalleryItems);
router.post('/gallery-items',       c.createGalleryItem);
router.put('/gallery-items/:id',    c.updateGalleryItem);
router.delete('/gallery-items/:id', c.deleteGalleryItem);

router.get('/products',        c.listProducts);
router.get('/products/:id',    c.getProduct);
router.post('/products',       c.createProduct);
router.put('/products/:id',    c.updateProduct);
router.delete('/products/:id', c.deleteProduct);

router.post('/ai/suggest', c.aiSuggest);

module.exports = router;
