const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');
const checkAdminJson = require('../middleware/check-admin-json');

const ProductController = require('../controllers/products')

router.post('/save', checkAuth, checkAdminJson, ProductController.save);
router.put('/save', checkAuth, checkAdminJson, ProductController.update);
router.delete('/remove/:id', checkAuth, checkAdminJson, ProductController.remove);
router.post('/get/:id', checkAuth, checkAdminJson, ProductController.get);
router.get('/units/:id', checkAuth, checkAdminJson, ProductController.getUnits);
router.get('/get_price/:productId/:unitId', checkAuth, checkAdminJson, ProductController.getProductPrice);
router.get('/search/:text', checkAuth, ProductController.searchProduct);
router.get('/most-popular', checkAuth, ProductController.getMostPopularProducts);
router.get('/:page*?', checkAuth, checkAdmin, ProductController.listAll);

module.exports = router;