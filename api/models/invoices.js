const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    shipping_date: {
        type: Date,
        default: Date.now
    },
    number: {
        type: Number,
        required: true,
        default: 0
    },
    shipping_address: {
        type: String
    },
    subtotal: {
        type: Number
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number
    },
    status: {
        type: String,
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Invoice = mongoose.model('Invoices', invoiceSchema);
module.exports = Invoice;