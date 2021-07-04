const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const warehouseSchema = new Schema({
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
    email: {
        type: String
    },
    contact: {
        type: String
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const Warehouse = mongoose.model('Warehouses', warehouseSchema);
module.exports = Warehouse;