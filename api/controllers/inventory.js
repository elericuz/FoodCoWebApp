const _ = require('lodash');

exports.items = (req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.render('dashboard', { name: 'Eric'})
};