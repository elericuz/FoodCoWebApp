const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/check-admin');
const checkAdminJson = require('../middleware/check-admin-json');

const ProviderController = require('../controllers/providers')

router.get('/', checkAuth, checkAdmin, ProviderController.listAll);
router.post('/save', checkAuth, checkAdminJson, ProviderController.save);
router.put('/save', checkAuth, checkAdminJson, ProviderController.update);
router.delete('/remove/:id', checkAuth, checkAdminJson, ProviderController.remove);
router.post('/get/:id', checkAdminJson, checkAuth, ProviderController.get);

module.exports = router;