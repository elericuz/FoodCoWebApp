const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkAdminJson = require('../middleware/check-admin-json');

const InvoiceController = require('../controllers/invoices')

router.post('/save', checkAuth, checkAdminJson, InvoiceController.save);
router.get('/download/:id', checkAuth, InvoiceController.downloadInvoice);
router.delete('/remove/:id', checkAuth, InvoiceController.deleteInvoice);

module.exports = router;