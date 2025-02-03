const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    code: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    commercial_name: {
        type: String
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    contact: {
        type: String
    },
    email: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    warehouses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: false
    }],
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;