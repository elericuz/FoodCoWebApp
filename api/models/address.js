const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    provider_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    type: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Addresses = mongoose.model('Address', addressSchema);
module.exports = Addresses;