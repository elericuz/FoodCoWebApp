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
const User = require('../models/users');
const jwt = require('jsonwebtoken');

exports.listAll = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);

    let criteria = { status: 'open' };
    if (_.lowerCase(req.userType) !== _.lowerCase('admin') &&
        _.lowerCase(req.userType) !== _.lowerCase('seller') &&
        _.lowerCase(req.userType) !== _.lowerCase('manager') &&
        _.lowerCase(req.userType) !== _.lowerCase('supervisor') &&
        _.lowerCase(req.userType) !== _.lowerCase('developer')) {
        criteria = {...criteria, user: tokenDecoded.userId};
    }

    res.setHeader('Content-Type', 'text/html');
    Order.find(criteria)
        .sort({'date': 'desc', 'number': 'desc'})
        .populate({
            path: 'client',
            model: 'Clients'
        })
        .then((result) => {
            res.render('orders/list', { orders: result});
        })
        .catch((err) => console.log(err));
};

exports.view = async (req, res, next) => {
    let allowed = false;
    if (req.userType === 'admin' ||
        req.userType === 'seller' ||
        req.userType === 'manager' ||
        req.userType === 'supervisor' ||
        req.userType === 'developer') {
        allowed = true;
    }

    let order = await getOrder(req.params.id);
    let invoices = await getInvoices(order._id)
    let invoicesDetails = [];

    for (const invoice of invoices) {
        invoicesDetails.push(await getInvoiceDetails(invoice._id));
    }

    const response = {
        order: order,
        invoices: invoices,
        invoicesDetails: invoicesDetails,
        allowed: allowed
    };

    res.setHeader('Content-Type', 'text/html');
    res.render('orders/view', response);
}

exports.new = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);
    let userId = tokenDecoded.userId;

    const user = await User.findById(userId)
        .select('client_id -_id')
        .populate({
            path: 'client_id',
            model: 'Clients',
            select: '_id name warehouses',
            populate: [
                {
                    path: 'warehouses',
                    model: 'Warehouses',
                    select: 'name'
                }
            ]
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let client = user.client_id;
    let warehouses = user.client_id.warehouses;
    let paymentMethods = await getPaymentMethods();
    let products = await getProducts();
    let units = await getUnits();
    let order = await createEmptyOrder();

    res.setHeader('Content-Type', 'text/html');
    res.render('orders/new', {
        order: order,
        today: moment().format('L'),
        units: units,
        clientData: client,
        warehouses: warehouses,
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
        .then(async result => {
            return await Detail.findOne(result._id)
                .populate({
                    path: 'unit_id',
                    model: 'Units',
                    select: '-_id name'
                })
                .populate({
                    path: 'product_id',
                    model: 'Products',
                    select: '-_id manufacturer_name'
                })
                .then(res => {
                    return res;
                })
                .catch(error => console.log(error))
        })
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
    return Product.find({status: true, inactive: false})
        .sort({manufacturer_name: 'asc'})
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
        .populate({
            path: 'client',
            model: 'Clients'
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