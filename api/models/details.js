const mongoose = require('mongoose');
const Unit = require('./units')
const Products = require('./products')

const detailsSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    quantity_pending: {
        type: Number,
        required: true,
        default: 1
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
    unit_price_list: {
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
        default: false
    }
}, {
    timestamps: true
});

const Detail = mongoose.model('Details', detailsSchema);
module.exports = Detail;