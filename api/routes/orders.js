const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const OrderController = require('../controllers/order')

router.get('/', checkAuth, OrderController.listAll);
router.get('/new', checkAuth, OrderController.new);
router.get('/view/:id', checkAuth, OrderController.view);
router.post('/add-product', checkAuth, OrderController.addProduct);
router.delete('/remove-product/:id', checkAuth, OrderController.removeProduct);
router.post('/place/:id', checkAuth, OrderController.placeOrder);

module.exports = router;