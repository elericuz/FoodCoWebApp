const _ = require('lodash');
const moment = require('moment');
const Order = require('../models/orders');
const Detail = require('../models/details');
const Product = require('../models/products');
const Unit = require('../models/units');
const PaymentMethod = require('../models/payment_method');
const storage = require('node-sessionstorage');
const jwt = require('jsonwebtoken');

exports.listAll = (req, res, next) => {
    let token = storage.getItem('token');
    let tokenDecoded = jwt.decode(token);

    res.setHeader('Content-Type', 'text/html');
    Order.find({
        user: tokenDecoded.userId,
        status: 'completed'
    })
        .sort({'date': 'desc', 'number': 'desc'})
        .then((result) => {
            res.render('orders/list', { orders: result});
        })
        .catch((err) => console.log(err));
};

exports.view = async (req, res, next) => {
    let order = await getOrder(req.params.id);

    res.setHeader('Content-Type', 'text/html');
    res.render('orders/view', { order: order });
}

async function getDetails(orderId) {
    return Detail.find({ order_id: orderId})
        .select('_id')
        .then(result => { return result; })
        .catch(err => console.log(err));
}

exports.new = async (req, res, next) => {
    today = moment().format('L');

    let paymentMethods = await getPaymentMethods();
    let products = await getProducts();
    let units = await getUnits();
    let order = await createEmptyOrder();

    res.setHeader('Content-Type', 'text/html');
    res.render('orders/new', {
        order: order,
        today: today,
        units: units,
        products: products,
        paymentMethods: paymentMethods
    });
}

exports.addProduct = async (req, res, next) => {
    const result = await addProduct(req.body);
    res.status(201).json(result);
}

exports.removeProduct = async (req, res, next) => {
    const result = await removeProduct(req.params.id);
    res.status(201).json(result);
}

exports.placeOrder = async (req, res, next) => {

    let token = storage.getItem('token');
    let tokenDecoded = jwt.decode(token);

    let details = await getDetails(req.params.id)

    let body = req.body;
    body.status = 'completed';
    body.tax = 0;
    body.subtotal = 0;
    body.total = 0;
    body.user = tokenDecoded.userId
    body.details = details.map(detail => { return detail._id; })

    order = await placeOrder(req.params.id, body);
    res.redirect('/orders');
}

async function placeOrder(id, data) {
    return Order.findByIdAndUpdate(id, data)
        .then(result => { return result })
        .catch(err => console.log(err))
}

async function removeProduct(id) {
    return Detail.findByIdAndDelete(id)
        .then(result => { return result })
        .catch(err => console.log(err));
}

async function addProduct(data) {
    let detail = new Detail(data);
    return detail.save()
        .then(result => { return result })
        .catch(err => console.log(err));
}

async function createEmptyOrder() {
    lastOrderNumber = await getLastOrderNumber()
    let nextOrderNumber = lastOrderNumber.number + 1;

    let order = Order({
        number: nextOrderNumber,
        status: 'pending'
    })
    return order.save()
        .then((result) => { return result })
        .catch(err => console.log(err));
}

async function getProducts() {
    return Product.find()
        .then((result) => { return result; })
        .catch(err => console.log('err'));
}

async function getUnits() {
    return Unit.find()
        .then(result => { return result; })
        .catch(err => console.log('err'));
}

async function getPaymentMethods() {
    return PaymentMethod.find()
        .then(result => { return result; })
        .catch(err => console.log('err'));
}

async function getOrder(id) {
    return Order.findById(id)
        .populate('user')
        .populate({
            path: 'details',
            populate: [
                {
                    path: 'unit_id',
                    model: 'Units'
                },
                {
                    path: 'product_id',
                    model: 'Products'
                }
            ],
        })
        .populate({
            path: 'payment_method',
            model: 'PaymentMethods'
        })
        .then((result) => { return result; })
        .catch((err) => { console.log(err); });
}

async function getLastOrderNumber() {
    let order = Order.findOne()
        .select('number -_id')
        .sort({number: 'desc'})
        .then(result => {
            if (_.isNull(result)) {
                return { number: 0 }
            } else {
                return result;
            }
        })
        .catch(err => console.log(err));
    return order
}