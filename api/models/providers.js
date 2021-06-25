const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const providerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    phone: {
        type: String
    },
    contact: {
        type: String
    }
}, {
    timestamps: true
});

const Provider = mongoose.model('Providers', providerSchema);
module.exports = Provider;