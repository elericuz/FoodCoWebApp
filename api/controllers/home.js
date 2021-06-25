const _ = require('lodash');
const Item = require('../models/items');

exports.index = (req, res, next) => {
    const token = req.cookies.userToken;
    res.setHeader('Content-Type', 'text/html');
    if (_.isUndefined(token) || _.isNull(token)) {
        res.render('index', {name: 'Eric'})
    } else {
        res.redirect('/orders');
    }
};

exports.dashboard = (req, res, next) => {
    Item.find()
        .then((result) => {
            console.log(result);
        })
        .catch((err) => {
            console.log(err);
        })
    res.render('dashboard', { name: 'Eric'})
};