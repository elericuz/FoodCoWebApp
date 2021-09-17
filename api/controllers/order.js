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
const Client = require('../models/clients');
const jwt = require('jsonwebtoken');

exports.listAll = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);

    let page = req.params.page;
    if (_.isUndefined(page) || !Number.isInteger(page*1)) {
        page = 1;
    }

    const limit = 16;
    const skip = (page === 1) ? 0 : (limit * (page-1))

    const clientUser = await User.findById(tokenDecoded.userId)
        .select('client_id -_id')
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let criteria = { status: 'open' };
    if (!req.admin) {
        criteria = {
            $and: [
                { status: 'open' },
                { $or: [
                    { user: tokenDecoded.userId },
                    { client: clientUser.client_id }
                ]},
            ]
        }
    }

    const orders = await getOrders(criteria, skip, limit);
    const totalPages = Math.ceil(orders.count/limit)
    if (page > totalPages) {
        res.redirect('/orders');
    }

    res.render('orders/list', {
        total: orders.count,
        showing: {
            from: ((page - 1) * limit) + 1,
            to: ((page * limit) > orders.count) ? orders.count : page * limit
        },
        totalPages: totalPages,
        currentPage: page,
        orders: orders.data,
        uri: 'orders'
    });
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
    let clients = await getClients();
    let products = await getProducts();
    let units = await getUnits();
    let order = await createEmptyOrder();

    res.setHeader('Content-Type', 'text/html');
    res.render('orders/new', {
        order: order,
        today: moment().format('L'),
        units: units,
        clientData: client,
        clients: clients,
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
        Detail.findByIdAndUpdate(detail._id, {status: true})
            .then(result => {
                return result;
            })
            .catch(err => console.log(err))
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

exports.deleteOrder = async (req, res, next) => {
    const token = req.cookies.userToken;
    let tokenDecoded = jwt.decode(token);

    await deleteOrder(req.params.id, tokenDecoded.userId)
        .then(result => {
            res.status(201).json({
                status: 'success',
                message: "Order deleted!"
            })
            return false;
        })
        .catch(err => {
            res.status(401).json({
                status: "failed",
                message: err.message
            })
        })
}

async function getClients() {
    return await Client.find({status: true})
        .select('name')
        .sort({ name: 'asc' })
        .sort({commercial_name: 'asc'})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function getDetails(orderId) {
    return await Detail.find({
        $and: [
            { order_id: orderId },
            { quantity_pending: { $gt: 0 }}
        ]
    })
        .select('_id unit_price total quantity_pending')
        .populate({
            path: 'product_id',
            model: 'Products',
            select: 'manufacturer_name'
        })
        .populate({
            path: 'unit_id',
            model: 'Units'
        })
        .then(result => { return result; })
        .catch(err => console.log(err));
}

async function getInvoices(orderId) {

    let criteria = {
        $and: [
            { order_id: orderId },
            { $or: [
                    { status: 'pending' },
                    { status: 'open' }
                ]},
        ]
    }

    let invoices = await Invoice.find(criteria)
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
    const total = (quantity * data.unit_price).toFixed(2);

    data.unit_price_list = productPrice;
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

async function getOrders(criteria, skip, limit) {
    return await Order.aggregate([
        {
            $match: criteria
        },
        {
            $sort: {'date': -1, 'number': -1}
        },
        {
            $lookup: {from: 'clients', localField: 'client', foreignField: '_id', as: 'client'}
        },
        {
            $facet: {
                "total": [{"$group": {_id: null, count: {$sum: 1}}}],
                "data": [{"$skip": skip}, {"$limit": limit}]
            }
        },
        {
            $unwind: "$total"
        },
        {
            $project: {
                count: "$total.count",
                data: "$data"
            }
        }
    ])
        .then(result => {
            return result[0];
        })
        .catch(err => console.log(err));
}

async function deleteOrder(id, userId) {
    return await Order.findByIdAndUpdate(id, { status: 'deleted', deletedBy: userId})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}