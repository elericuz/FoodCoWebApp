const _ = require('lodash');
const moment = require('moment');
const Order = require('../models/orders');
const Detail = require('../models/details');
const Invoice = require('../models/invoices');
const InvoiceDetails = require('../models/invoicedetails');
const Product = require('../models/products');
const Unit = require('../models/units');
const PaymentMethod = require('../models/payment_method');
const ProductPrices = require('../models/product_prices');
const jwt = require('jsonwebtoken');

exports.listAll = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);

    res.setHeader('Content-Type', 'text/html');
    Order.find({
        // user: tokenDecoded.userId,
        // status: 'open'
    })
        .sort({'date': 'desc', 'number': 'desc'})
        .then((result) => {
            res.render('orders/list', { orders: result});
        })
        .catch((err) => console.log(err));
};

exports.view = async (req, res, next) => {
    let order = await getOrder(req.params.id);
    let invoices = await getInvoices(order._id)
    console.log(invoices);
    let invoicesDetails = [];

    for (const invoice of invoices) {
        invoicesDetails.push(await getInvoiceDetails(invoice._id));
    }

    res.setHeader('Content-Type', 'text/html');
    res.render('orders/view', { order: order, invoices: invoices, invoicesDetails: invoicesDetails });
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

exports.get = async (req, res, next) => {
    const details = await getDetails(req.params.id)
    res.status(201).json(details);
}

exports.placeOrder = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);

    let details = await getDetails(req.params.id)

    let total = 0;
    details.forEach(detail => {
        total += detail.total;
    })

    const tax = 0;
    const subtotal = 0;

    let body = req.body;
    body.status = 'open';
    body.tax = tax;
    body.subtotal = subtotal;
    body.total = total;
    body.user = tokenDecoded.userId
    body.details = details.map(detail => { return detail._id; })

    providerorder = await placeOrder(req.params.id, body);
    res.redirect('/orders');
}

async function getDetails(orderId) {
    return Detail.find({ order_id: orderId})
        .select('_id unit_price total quantity_pending')
        .then(result => { return result; })
        .catch(err => console.log(err));
}

async function getInvoices(orderId) {
    let invoices = await Invoice.find({order_id: orderId})
        .populate({
            path: 'user',
            model: 'User',
            select: '-_id name lastname'
        })
        .then(result => {
            // console.log(result);
            return result;
        })
        .catch(err => console.log(err));

    return invoices;
}

async function getInvoiceDetails(invoiceId) {
    return await InvoiceDetails.find({invoice_id: invoiceId})
        .populate({
            path: 'unit_id',
            model: 'Units'
        })
        .populate({
            path: 'product_id',
            model: 'Products'
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err))
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
    const productPrice = await ProductPrices.findOne({unit_id: data.unit_id, product_id: data.product_id, status: true})
        .select('price -_id')
        .then(result => {
            return result.price;
        })
        .catch(err => console.log(err));

    const quantity = _.toInteger(data.quantity)
    const total = quantity * productPrice;

    data.unit_price = productPrice;
    data.total = total;
    data.quantity_pending = quantity

    let detail = new Detail(data);
    return detail.save()
        .then(result => { return result; })
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
    return Product.find({status: true})
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