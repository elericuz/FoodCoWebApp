const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const ProductController = require('../controllers/products')

router.get('/', checkAuth, ProductController.listAll);
router.post('/save', checkAuth, ProductController.save);
router.put('/save', checkAuth, ProductController.update);
router.delete('/remove/:id', checkAuth, ProductController.remove);
router.post('/get/:id', checkAuth, ProductController.get);

module.exports = router;