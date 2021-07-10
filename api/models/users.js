const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String
    },
    lastname: {
        type: String
    },
    email_address: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        default: ""
    },
    type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserTypes',
        required: true,
        default: '60e7d49dd1ffd101c8862ce6'
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clients'
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const Users = mongoose.model('User', userSchema);
module.exports = Users;