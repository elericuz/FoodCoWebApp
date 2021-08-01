const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    shipping_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    number: {
        type: Number,
        required: true
    },
    contact: {
        type: String,
    },
    phone: {
        type: String
    },
    shipping_address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zipcode: {
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
        type: Number,
        default: 0,
        required: true
    },
    total: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        default: 'pending'
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Orders', orderSchema);
module.exports = Order;