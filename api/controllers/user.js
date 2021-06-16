const _ = require('lodash');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const storage = require('node-sessionstorage');
const User = require('../models/users');

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
                        'mysecret',
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