const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unitsSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Unit = mongoose.model('Units', unitsSchema);
module.exports = Unit;