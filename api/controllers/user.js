const _ = require('lodash');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const UserType = require('../models/usertype');
const Address = require('../models/address');
const Client = require('../models/clients');

const maxAge = 7 * 24 * 60 * 60;
const createToken = (user) => {
    return jwt.sign(
        {
            name: user.name,
            lastname: user.lastname,
            email_address: user.email_address,
            userId: user._id
        },
        process.env.JWT_KEY,
        {
            expiresIn: maxAge
        }
    );
};

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
                    const token = createToken(user[0]);
                    res.cookie('userToken', token, { httpOnly: true, maxAge: maxAge * 1000 });
                    res.status(200).json({
                        message: "success"
                    })
                    // res.redirect('/orders');
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
    const token = req.cookies.userToken;
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

exports.updatePersonalInfo = async (req, res, next) => {
    const token = req.cookies.userToken;
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
    const token = req.cookies.userToken;
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

exports.changePassword = (req, res, next) => {
    const token = req.cookies.userToken;
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

exports.listAll = async (req, res, next) => {
    const userTypes = await getUserTypes();
    const clients = await getClients();
    const users = await getUsers()
    res.render('users/list', { users: users, userTypes: userTypes, clients: clients });
}

exports.get = async (req, res, next) => {
    const user = await getUser(req.params.id, true);
    res.status(200).json({
        data: user
    });
}

exports.save = async (req, res, next) => {
    res.status(200).json({
        message: 'ok'
    })
}

exports.update = async (req, res, next) => {

    console.log(req.body);
    const password = req.body.password
    if (!_.isEmpty(_.trim(password))) {

    }

    const userId = req.body.idUser
    const data = {
        name: req.body.name,
        lastname: req.body.lastname,
        email_address: req.body.email_address,
        phonenumber: req.body.phonenumber,
        type_id: req.body.type_id,
        client_id: _.isUndefined(req.body.client_id) ? null : req.body.client_id,
        status: req.body.status
    }

    await updateUserInfo(userId, data)
        .then(result => {
            res.status(200).json({
                message: 'ok',
                data: result
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong",
                data: err
            })
        });
}

async function getClients() {
    return Client.find({status: true})
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}

async function getUserTypes() {
    return UserType.find()
        .then(result => {
            return result;
        })
        .catch(err => console.log(err))
}

async function getAddresses(user_id) {
    return Address.find({ user_id: user_id })
        .sort({'createdAt': 'asc'})
        .then(result => { return result; })
        .catch(err => console.log(err));
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

async function updateUserInfo(userId, data) {
    console.log(userId);
    console.log(data);
    return User.findByIdAndUpdate(userId, data)
        .then(result => {
            console.log(result);
            return result;
        })
        .catch(err => console.log(err));
}

async function getUser(userId, admin=false) {
    if (admin) {
        return User.findById(userId)
            .populate({
                path: 'type_id',
                model: 'UserTypes'
            })
            .populate({
                path: 'client_id',
                model: 'Clients'
            })
            .then(result => { return result; })
            .catch(err => console.log(err));
    } else {
        return User.findById(userId)
            .select('-type_id')
            .then(result => { return result; })
            .catch(err => console.log(err));
    }
}

async function getUsers() {
    return User.find({status: true})
        .sort({'lastname': 'asc'})
        .populate({
            path: 'type_id',
            model: 'UserTypes'
        })
        .then(result => {
            return result;
        })
        .catch(err => console.log(err));
}