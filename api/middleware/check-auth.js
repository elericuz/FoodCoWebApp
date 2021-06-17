const jwt = require('jsonwebtoken');
const storage = require('sessionstorage')

module.exports = (req, res, next) => {
    try {
        const token = storage.getItem('token');
        const decoded = jwt.verify(token, 'mysecret');
        req.userData = decoded;
    } catch (error) {
        res.redirect('/');
    }
    next();
 };