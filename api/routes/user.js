const express = require('express');
const router = express.Router();
const storage = require('sessionstorage')
const checkAuth = require('../middleware/check-auth');

const UserController = require('../controllers/user')

router.get('/signup', (req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.render('signup')
})
router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.delete('/:userId', checkAuth, UserController.delete);
router.get('/logout', (req, res, next) => {
    storage.removeItem('token')
    res.redirect('/');
})
router.get('/profile', checkAuth, UserController.profile);
router.post('/update-personal-info', checkAuth, UserController.updatePersonalInfo);
router.post('/add-address', checkAuth, UserController.addAddress);
router.delete('/remove-address/:id', checkAuth, UserController.removeAddress);
router.post('/change-password', checkAuth, UserController.changePassword);

module.exports = router;