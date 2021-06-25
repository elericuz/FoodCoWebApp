const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const ProviderController = require('../controllers/providers')

router.get('/', checkAuth, ProviderController.listAll);
router.post('/save', checkAuth, ProviderController.save);
router.put('/save', checkAuth, ProviderController.update);
router.delete('/remove/:id', checkAuth, ProviderController.remove);
router.post('/get/:id', checkAuth, ProviderController.get);

module.exports = router;