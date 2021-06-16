const mongoose = require('mongoose');
const User = require('./users')

const orderSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    number: {
        type: Number,
        required: true
    },
    shipping_address: {
        type: String
    },
    payment_method: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethods'
    },
    details: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Details'
    }],
    subtotal: {
        type: Number
    },
    tax: {
        type: Number
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

const Order = mongoose.model('Orders', orderSchema);
module.exports = Order;