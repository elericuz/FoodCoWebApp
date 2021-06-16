const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethods', paymentMethodSchema);
module.exports = PaymentMethod;