const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const storage = require('node-sessionstorage');
const User = require('../models/users');

const UserController = require('../controllers/user')

router.get('/signup', (req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.render('signup')
})
router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.delete('/:userId', UserController.delete);
router.get('/logout', (req, res, next) => {
    storage.removeItem('token')
    res.redirect('/');
})

module.exports = router;