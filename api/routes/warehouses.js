const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const WarehouseController = require('../controllers/warehouse')

router.get('/get/:id', checkAuth, WarehouseController.get);

module.exports = router;