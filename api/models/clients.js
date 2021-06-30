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
        type: mongoose.Schema.Types.ObjectId
    },
    contact: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const Client = mongoose.model('Clients', clientSchema);
module.exports = Client;