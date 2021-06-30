const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const ClientsController = require('../controllers/clients')

router.get('/', checkAuth, ClientsController.listAll);
router.post('/save', checkAuth, ClientsController.save);
router.put('/save', checkAuth, ClientsController.update);
router.delete('/remove/:id', checkAuth, ClientsController.remove);
router.post('/get/:id', checkAuth, ClientsController.get);

module.exports = router;