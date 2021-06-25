const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
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

const Client = mongoose.model('Clients', clientSchema);
module.exports = Client;