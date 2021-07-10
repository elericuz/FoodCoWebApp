const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const InvoiceController = require('../controllers/invoices')

router.post('/save', checkAuth, InvoiceController.save);



router.get('/', checkAuth, InvoiceController.listAll);
router.get('/new', checkAuth, InvoiceController.new);
router.get('/view/:id', checkAuth, InvoiceController.view);
router.post('/add-product', checkAuth, InvoiceController.addProduct);
router.delete('/remove-product/:id', checkAuth, InvoiceController.removeProduct);
router.post('/place/:id', checkAuth, InvoiceController.placeOrder);

module.exports = router;