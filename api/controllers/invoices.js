const _ = require('lodash');
const moment = require('moment');
const Invoice = require('../models/invoices');
const InvoiceDetails = require('../models/invoicedetails');
const Order = require('../models/orders');
const Detail = require('../models/details');
const Product = require('../models/products');
const Unit = require('../models/units');
const PaymentMethod = require('../models/payment_method');
const ProductPrices = require('../models/product_prices');
const jwt = require('jsonwebtoken');


exports.save = async (req, res, next) => {
    const nextNumber = await getLastInvoiceNumber();

    const data = {
        order_id: req.body.orderId,
        shipping_date: req.body.date,
        number: nextNumber.number + 1
    }

    let invoice = await new Invoice(data)
        .save()
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let invoiceDetails = []
    for (const value of req.body.detail.detailId) {
        let index = req.body.detail.detailId.indexOf(value);
        let detail = {
            invoice_id: invoice._id,
            order_id: req.body.orderId,
            quantity: req.body.detail.quantity[index],
            unit_id: req.body.detail.unitId[index],
            product_id: req.body.detail.productId[index],
            unit_price: req.body.detail.unitPrice[index],
            total: req.body.detail.unitPrice[index] * req.body.detail.quantity[index]
        };

        if (req.body.detail.quantity[index] > 0) {
            await new InvoiceDetails(detail)
                .save()
                .then(result => {
                    invoiceDetails.push(result);
                    return result;
                })
                .catch(err => console.log(err));
        }
    }

    res.status(200).json({
        message: 'ok',
        invoice: invoice,
        invoiceDetails: invoiceDetails
    })
}

async function getLastInvoiceNumber() {
    let invoice = Invoice.findOne()
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
    return invoice
}

async function save() {

}


exports.listAll = (req, res, next) => {
    const token = req.cookies.userToken;
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
        .select('_id total')
        .then(result => { return result; })
        .catch(err => console.log(err));
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