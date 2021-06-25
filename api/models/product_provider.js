const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productProviderSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

const ProductProvider = mongoose.model('ProductProviders', productProviderSchema);
module.exports = ProductProvider;