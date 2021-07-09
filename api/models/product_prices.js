const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productPricesSchema = new Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    unit_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const ProductPrices = mongoose.model('ProductPrice', productPricesSchema);
module.exports = ProductPrices;