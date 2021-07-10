const mongoose = require('mongoose');

const invoiceDetailsSchema = new mongoose.Schema({
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Units'
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    },
    unit_price: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const InvoiceDetail = mongoose.model('InvoiceDetails', invoiceDetailsSchema);
module.exports = InvoiceDetail;