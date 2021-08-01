const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkAdminJson = require('../middleware/check-admin-json');

const WarehouseController = require('../controllers/warehouse')

router.get('/get/:id', checkAuth, checkAdminJson, WarehouseController.get);

module.exports = router;