const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const InvoiceController = require('../controllers/invoices')

router.post('/save', checkAuth, InvoiceController.save);

module.exports = router;