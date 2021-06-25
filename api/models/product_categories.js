const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCategorySchema = new Schema({
    Category: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const ProductCategory = mongoose.model('ProductCategories', productCategorySchema);
module.exports = ProductCategory;