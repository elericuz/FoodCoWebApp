const _ = require('lodash');
const Item = require('../models/items');

exports.index = (req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.render('index', { name: 'Eric'})
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