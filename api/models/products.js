const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        default: 0
    },
    price: {
        type: "Number",
        required: true,
        default: 0
    },
}, {
    timestamps: true
});

const Product = mongoose.model('Products', productSchema);
module.exports = Product;