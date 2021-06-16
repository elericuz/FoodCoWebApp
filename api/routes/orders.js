const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/order')

router.get('/', OrderController.listAll);
router.get('/new', OrderController.new);
router.get('/view/:id', OrderController.view);
router.post('/add-product', OrderController.addProduct);
router.delete('/remove-product/:id', OrderController.removeProduct);
router.post('/place/:id', OrderController.placeOrder);

module.exports = router;