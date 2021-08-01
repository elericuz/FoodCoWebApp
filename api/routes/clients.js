const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');
const checkAdminJson = require('../middleware/check-admin-json');

const ClientsController = require('../controllers/clients')

router.get('/', checkAuth, checkAdmin, ClientsController.listAll);
router.post('/save', checkAuth, checkAdminJson, ClientsController.save);
router.put('/save', checkAuth, checkAdminJson, ClientsController.update);
router.delete('/remove/:id', checkAuth, checkAdminJson, ClientsController.remove);
router.post('/get/:id', checkAuth, checkAdminJson, ClientsController.get);
router.post('/warehouse/save', checkAuth, checkAdminJson, ClientsController.saveWarehouse);
router.put('/warehouse/save', checkAuth, checkAdminJson, ClientsController.updateWarehouse);
router.delete('/warehouse/remove/:id', checkAuth, checkAdminJson, ClientsController.removeWarehouse);
router.post('/warehouse/get/:id', checkAuth, checkAdminJson, ClientsController.getWarehouse);
router.post('/warehouses/:id', checkAuth, checkAdminJson, ClientsController.getWarehouses);

module.exports = router;