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
    contact: {
        type: String
    }
}, {
    timestamps: true
});

const Warehouse = mongoose.model('Warehouses', warehouseSchema);
module.exports = Warehouse;