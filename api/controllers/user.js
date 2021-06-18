const _ = require('lodash');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const storage = require('sessionstorage')
const User = require('../models/users');
const Address = require('../models/address')

exports.login = (req, res, next) => {
    User.find({email_address: req.body.email_address})
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth Failed'
                    })
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            name: user[0].name,
                            lastname: user[0].lastname,
                            email_address: user[0].email_address,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1d'
                        }
                    );
                    storage.setItem('token', token);
                    res.redirect('/orders');
                } else {
                    res.status(401).json({
                        message: 'Auth Failed'
                    });
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
};

exports.signup = (req, res, next) => {
    User.find({email_address: req.body.email_address})
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail Exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            name: req.body.name,
                            lastname: req.body.lastname,
                            email_address: req.body.email_address,
                            password: hash
                        })
                        user.save()
                            .then(result => {
                                res.redirect('/')
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch(err => console.log(err))
}

exports.delete = (req, res, next) => {
    User.remove({_id: req.params.userId})
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
}

exports.profile = async (req, res, next) => {
    let token = storage.getItem('token');
    let tokenDecoded = jwt.decode(token);
    let user = await getUser(tokenDecoded.userId);
    let addresses = await getAddresses(tokenDecoded.userId);

    res.render('users/profile', {
        userData: {
            user: user,
            addresses: addresses
        }
    });
}

async function getAddresses(user_id) {
    return Address.find({ user_id: user_id })
        .sort({'createdAt': 'asc'})
        .then(result => { return result; })
        .catch(err => console.log(err));
}

exports.updatePersonalInfo = async (req, res, next) => {
    let token = storage.getItem('token');
    let tokenDecoded = jwt.decode(token);

    User.findByIdAndUpdate(tokenDecoded.userId, req.body)
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "User Updated",
                data: result
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
}

exports.addAddress = async (req, res, next) => {
    let token = storage.getItem('token');
    let tokenDecoded = jwt.decode(token);

    req.body.user_id = tokenDecoded.userId;

    await addAddress(req.body)
        .then((response) => {
            console.log(response)
            res.status(200).json({
                message: 'Address Added.',
                data: response
            });
        })
        .catch(err => {
            // console.log(err)
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
}

exports.removeAddress = async (req, res, next) => {
    await removeAddress(req.params.id)
        .then((response) => {
            res.status(200).json({
                message: 'Address removed.',
                data: response
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
}

async function removeAddress(id) {
    return Address.findByIdAndDelete(id)
        .then(result => { return result; })
        .catch(err => { return err; });
}

async function addAddress(data) {
    let address = new Address(data);
    return address.save()
        .then(result => { return result; })
        .catch(err => { return err; });
}

async function updateUserInfo(userID, data) {
    return User.findByIdAndUpdate(userID, data)
        .then(result => { return result; })
        .catch(err => console.log(err));
}

async function getUser(userId) {
    return User.findById(userId)
        .then(result => { return result; })
        .catch(err => console.log(err));
}

exports.changePassword = (req, res, next) => {
    let token = storage.getItem('token');
    let tokenDecoded = jwt.decode(token);

    User.findById(tokenDecoded.userId)
        .then(user => {
            bcrypt.compare(req.body.currentPassword, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Something went wrong.'
                    })
                }
                if (result) {
                    if (req.body.password == req.body.confirmPassword) {
                        bcrypt.hash(req.body.password, 10, (err, hash) => {
                            if (err) {
                                return res.status(500).json({
                                    error: err,
                                    message: 'Something went wrong'
                                });
                            } else {
                                User.findByIdAndUpdate(tokenDecoded.userId, {password: hash})
                                    .then(result => {
                                        res.status(200).json({
                                            message: 'Password updated.',
                                        });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            error: err,
                                            message: 'Something went wrong'
                                        });
                                    });
                            }
                        });
                    } else {
                        res.status(401).json({
                            message: 'The current password you wrote is wrong'
                        });
                    }
                } else {
                    res.status(401).json({
                        message: 'The current password you wrote is wrong'
                    });
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
}