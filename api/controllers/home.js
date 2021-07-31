const _ = require('lodash');
const Product = require('../models/products');
const Orders = require('../models/orders');
const jwt = require('jsonwebtoken');
const Invoice = require('../models/invoices');

exports.index = (req, res, next) => {
    const token = req.cookies.userToken;
    res.setHeader('Content-Type', 'text/html');
    if (_.isUndefined(token) || _.isNull(token)) {
        res.render('index', {name: 'Eric'})
    } else {
        res.redirect('/dashboard');
    }
};

exports.dashboard = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);

    let admin = true
    if (_.lowerCase(req.userType) !== _.lowerCase('admin') &&
        _.lowerCase(req.userType) !== _.lowerCase('seller') &&
        _.lowerCase(req.userType) !== _.lowerCase('manager') &&
        _.lowerCase(req.userType) !== _.lowerCase('supervisor') &&
        _.lowerCase(req.userType) !== _.lowerCase('developer')) {
        admin = false;
    }

    const latestProducts = await Product.find({'status': true})
        .select('manufacturer_name createdAt')
        .sort({'createdAt': 'desc'})
        .limit(10)
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let criteria = { status: { $in: [ 'open', 'cloase' ] } };
    if (!admin) {
        criteria = {
            $and: [
                { user: tokenDecoded.userId },
                criteria
            ]
        }
    }

    const lastOrders = await Orders.find(criteria)
        .select('number client shipping_date total user status')
        .populate({
            path: 'client',
            model: 'Clients',
            select: 'name -_id'
        })
        .populate({
            path: 'user',
            model: 'User',
            select: 'name lastname -_id'
        })
        .sort({'createdAt': 'desc'})
        .limit(5)
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let searchParsms = { order_id: {$ne: null} }
    if (!admin) {
        let orderIds = []
        lastOrders.forEach(order => {
            orderIds.push(order._id)
        });
        searchParsms = { order_id: { $in: orderIds }}
    }

    const lastInvoices = await Invoice.find(
        searchParsms
    )
        .select('number order_id shipping_date total user status')
        .populate({
            path: 'user',
            model: 'User',
            select: 'name lastname -_id'
        })
        .populate({
            path: 'order_id',
            model: 'Orders',
            select: 'number client status',
            populate: {
                path: 'client',
                model: 'Clients',
                select: 'name -_id'
            }
        })
        .sort({'createdAt': 'desc'})
        .limit(5)
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    res.render('dashboard', {
        latestProducts: latestProducts,
        lastOrders: lastOrders,
        lastInvoices: lastInvoices
    })
};