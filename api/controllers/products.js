const _ = require('lodash');
const moment = require('moment');
const Product = require('../models/products');

exports.listAll = (req, res, next) => {
    res.render('products/list', { products: []})
};