const _ = require('lodash');
const moment = require('moment');
const Order = require('../models/orders');
const Detail = require('../models/details');
const Product = require('../models/products');
const Unit = require('../models/units');
const PaymentMethod = require('../models/payment_method');

exports.listAll = (req, res, next) => {
    res.setHeader('Content-Type', 'text/html');
    Order.find({status: 'completed'})
        .then((result) => {
            res.render('orders/list', { orders: result});
        })
        .catch((err) => {
            console.log(err);
        })
};

exports.view = async (req, res, next) => {
    // var details = await getDetails(req.params.id)
    //
    // let update = await updateOrder(req.params.id, details)
    // console.log(update)

    // Order.findByIdAndUpdate(req.params.id, details)
    //     .then(results => { console.log(results); })
    //     .catch(err => console.log(err));

    var order = await getOrder(req.params.id);

    console.log(order);
    res.setHeader('Content-Type', 'text/html');
    res.render('orders/view', { order: order });
}

async function updateOrder(orderId, details) {
    var order = await getOrder(orderId);
    order.details = details.map(detail => { return detail.order_id; })

    return Order.findByIdAndUpdate(orderId, order)
        .then(results => { return results; })
        .catch(err => console.log(err));
}

async function getDetails(orderId) {
    return Detail.find({ order_id: orderId})
        .select('order_id -_id')
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
    var body = req.body;
    body.status = 'completed';
    body.tax = 0;
    body.subtotal = 0;
    body.total = 0;
    body.user = '60c82ece2f55d2da9a9a8dbb'

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
    return Order.findOne()
        .select('number -_id')
        .sort({number: 'desc'})
        .then(result => { return result; })
        .catch(err => console.log(err));
}