const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const ClientsController = require('../controllers/clients')

router.get('/', checkAuth, ClientsController.listAll);
router.post('/save', checkAuth, ClientsController.save);
router.put('/save', checkAuth, ClientsController.update);
router.delete('/remove/:id', checkAuth, ClientsController.remove);
router.post('/get/:id', checkAuth, ClientsController.get);
router.post('/warehouse/save', checkAuth, ClientsController.saveWarehouse);
router.put('/warehouse/save', checkAuth, ClientsController.updateWarehouse);
router.delete('/warehouse/remove/:id', checkAuth, ClientsController.removeWarehouse);
router.post('/warehouse/get/:id', checkAuth, ClientsController.getWarehouse);

module.exports = router;