const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const InvoiceController = require('../controllers/invoices')

router.post('/save', checkAuth, InvoiceController.save);
router.get('/download/:id', checkAuth, InvoiceController.downloadInvoice);

module.exports = router;