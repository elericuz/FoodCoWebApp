const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    spanish_name: {
        type: String
    },
    code: {
        type: String,
        required: true,
        default: 0
    },
    provider: {
        type: String
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