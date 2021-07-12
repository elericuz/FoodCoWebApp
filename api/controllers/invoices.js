const _ = require('lodash');
const Invoice = require('../models/invoices');
const InvoiceDetails = require('../models/invoicedetails');
const Detail = require('../models/details');
const Product = require('../models/products');
const Unit = require('../models/units');
const jwt = require('jsonwebtoken');

exports.save = async (req, res, next) => {
    if (_.isUndefined(req.body.detail)) {
        return res.status(400).json({
            status: 'error',
            message: "You can not create an empty invoice"
        })
    }

    if (!_.isArray(req.body.detail.detailId)) {
        req.body.detail.detailId = [req.body.detail.detailId]
        req.body.detail.unitId = [req.body.detail.unitId]
        req.body.detail.productId = [req.body.detail.productId]
        req.body.detail.unitPrice = [req.body.detail.unitPrice]
        req.body.detail.total = [req.body.detail.total]
        req.body.detail.quantity = [req.body.detail.quantity]
    }

    let totalProducts = 0;
    for (const value of req.body.detail.detailId) {
        let index = req.body.detail.detailId.indexOf(value);
        if (_.toInteger(req.body.detail.quantity[index]) > 0) {
            let orderDetail = await getOrderDetail(req.body.detail.detailId[index]);
            let diff = orderDetail.quantity_pending - _.toInteger(req.body.detail.quantity[index]);
            if (diff < 0) {
                return res.status(400).json({
                    status: 'error',
                    message: "You can not provide more articles than requested/pending",
                })
            }
            totalProducts = totalProducts + _.toInteger(req.body.detail.quantity[index]);
        }
    }

    if (totalProducts === 0) {
        return res.status(400).json({
            status: 'error',
            message: "You can not create an empty invoice"
        })
    }

    const token = req.cookies.userToken;
    const tokenDecoded = jwt.decode(token);
    const nextNumber = await getLastInvoiceNumber();
    const data = {
        order_id: req.body.orderId,
        shipping_date: req.body.date,
        number: nextNumber.number + 1,
        user: tokenDecoded.userId
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
        let orderDetail = await getOrderDetail(req.body.detail.detailId[index]);
        let quantity_pending = orderDetail.quantity_pending;

        let detail = {
            invoice_id: invoice._id,
            order_id: req.body.orderId,
            quantity: req.body.detail.quantity[index],
            unit_id: req.body.detail.unitId[index],
            product_id: req.body.detail.productId[index],
            unit_price: req.body.detail.unitPrice[index],
            total: req.body.detail.unitPrice[index] * req.body.detail.quantity[index],
            user: tokenDecoded.userId
        };

        if (req.body.detail.quantity[index] > 0) {
            await new InvoiceDetails(detail)
                .save()
                .then(async result => {
                    invoiceDetails.push({
                        invoice_id: result._id,
                        order_id: result.order_id,
                        quantity: result.quantity,
                        unit: await getUnit(result.unit_id),
                        product: await getProduct(result.product_id),
                        unit_price: result.unit_price,
                        total: result.unit_price * result.quantity
                    });

                    quantity_pending = quantity_pending - result.quantity;
                    await Detail.findByIdAndUpdate(
                        req.body.detail.detailId[index],
                        { quantity_pending: quantity_pending})
                        .then(response => {
                            return response;
                        })
                        .catch(error => console.log(error));

                    return result;
                })
                .catch(err => console.log(err));
        }
    }

    res.status(201).json({
        status: 'ok',
        invoice: invoice,
        invoiceDetails: invoiceDetails,
        attended: tokenDecoded.name + " " + tokenDecoded.lastname
    })
}

async function getUnit(id) {
    return Unit.findById(id)
        .select('name -_id')
        .then(result => {
            return result.name;
        })
        .catch(err => console.log(err));
}

async function getProduct(id) {
    return Product.findById(id)
        .select('manufacturer_name -_id')
        .then(result => {
            return result.manufacturer_name;
        })
        .catch(err => console.log(err));
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

async function getOrderDetail(id) {
    return Detail.findById(id)
        .then(result => { return result; })
        .catch(err => console.log(err));
}