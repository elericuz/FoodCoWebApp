const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Usertype = mongoose.model('UserTypes', userTypeSchema);
module.exports = Usertype;