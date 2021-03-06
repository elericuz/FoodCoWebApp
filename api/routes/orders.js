const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkAuthAdminJson = require('../middleware/check-admin-json');

const OrderController = require('../controllers/order')

router.get('/new', checkAuth, OrderController.new);
router.get('/view/:id', checkAuth, OrderController.view);
router.post('/add-product', checkAuth, OrderController.addProduct);
router.delete('/remove-product/:id', checkAuth, OrderController.removeProduct);
router.post('/place/:id', checkAuth, OrderController.placeOrder);
router.get('/get-details/:id', checkAuth, OrderController.get);
router.delete('/delete/:id', checkAuth, checkAuthAdminJson, OrderController.deleteOrder);
router.get('/:page*?', checkAuth, OrderController.listAll);

module.exports = router;