const _ = require('lodash');
const Invoice = require('../models/invoices');
const InvoiceDetails = require('../models/invoicedetails');
const Order = require('../models/orders');
const Detail = require('../models/details');
const Product = require('../models/products');
const Unit = require('../models/units');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const moment = require('moment');

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
        client_id: req.body.clientId,
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

exports.downloadInvoice = async (req, res, next) => {
    var items = [];

    let invoice = await Invoice.findById(req.params.id)
        .select('number order_id date user')
        .populate({
            path: 'user',
            model: 'User',
            select: 'name lastname -_id'
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let invoiceDetails = await InvoiceDetails.find({invoice_id: invoice._id})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let order = await Order.findById(invoice.order_id)
        .select('shipping_address city state zipcode shipping_date date user number phone client contact')
        .populate({
            path: 'user',
            model: 'User',
            select: 'name lastname -_id'
        })
        .populate({
            path: 'client',
            model: 'Clients',
            populate: {
                path: 'address',
                model: 'Address'
            }
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));

    let total = 0;
    for (const invoiceDetail of invoiceDetails) {
        let details = await Detail.findOne({
            order_id: invoiceDetail.order_id,
            product_id: invoiceDetail.product_id,
            unit_id: invoiceDetail.unit_id,
            status: true
        })
            .select('quantity unit_id product_id unit_price total')
            .populate({
                path: 'product_id',
                model: 'Products',
                select: 'code manufacturer_name -_id'
            })
            .populate({
                path: 'unit_id',
                model: 'Units',
                select: ('-_id')
            })
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));

        total = total + invoiceDetail.total;

        items.push({
            ordered: details.quantity,
            shipped: invoiceDetail.quantity,
            pack: _.upperCase(details.unit_id.name),
            item_code: _.padStart(details.product_id.code, 5, '0'),
            description: _.upperCase(details.product_id.manufacturer_name),
            unit_price: '$' + details.unit_price.toFixed(2).toLocaleString(),
            amount: '$' + invoiceDetail.total.toFixed(2).toLocaleString()
        });
    }

    let orderData = {
        number: _.padStart(invoice.number, 6, '0'),
        bill_to: {
            street: _.upperCase(order.client.address.street),
            city: _.upperCase(order.client.address.city),
            state: _.upperCase(order.client.address.state),
            zipcode: _.upperCase(order.client.address.zipcode)
        },
        shipping_address: {
            street: _.upperCase(order.shipping_address),
            city: _.upperCase(order.city),
            state: _.upperCase(order.state),
            zipcode: _.upperCase(order.zipcode)
        },
        phone: order.phone,
        client: {
            code: order.client.code,
            name: order.client.name
        },
        contact: order.contact,
        date: moment(invoice.date).format('L'),
        due_date: moment(order.shipping_date).format('L'),
        order_date: moment(order.date).format('L'),
        order_received_at: moment(order.date).format('HH:MM'),
        salesperson: _.upperCase(invoice.user.name + ' ' + invoice.user.lastname),
        ordertaker: _.upperCase(order.user.name + ' ' + order.user.lastname),
        our_order_number: _.padStart(order.number, 6, '0'),
        total: '$' + total.toFixed(2).toLocaleString()
    }

    let response = {
        data: orderData,
        items: items
    }

    let templateHtml = fs.readFileSync(path.join(process.cwd(), 'api/views/invoices/invoice-pdf.ejs'), 'utf8')
    let template = ejs.compile(templateHtml);
    let html = template(response);

    let pdfPath = path.join('public/pdf', 'invoice-' + invoice.number + '.pdf');

    let options = {
        format: 'a4',
        displayHeaderFooter: true,
        headerTemplate: "<p></p>",
        footerTemplate: `
        <div style="width: 90%; text-align: right; font-size: 9px; padding: 5px 5px 0; color: #bbb; position: relative;">
        <div style="position: absolute; left: 5px; top: 5px; margin-left: 30px;">Invoice Number: ` + _.padStart(invoice.number, 6, '0') + `</div>
        <div style="position: absolute; right: 5px; top: 5px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>
        </div>`,
        margin: {
            top: '10px',
            bottom: '270px'
        },
        printBackground: true,
        path: pdfPath
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions'],
        headless: true
    });

    let page = await browser.newPage();

    await page.goto(`data:text/html;charset=UTF-8,${html}`, {
        waitUntil: 'networkidle0'
    });

    await page.pdf(options);
    await browser.close();

    res.status(201).json({
        status: "success",
        path: '/pdf/invoice-' + invoice.number + '.pdf'
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