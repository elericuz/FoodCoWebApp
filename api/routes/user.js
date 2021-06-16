const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const storage = require('node-sessionstorage');

const User = require('../models/users');

router.post('/signup', (req, res, next) => {
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
                                console.log(result);
                                res.status(201).json({
                                    message: "User Created!"
                                });
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
});

router.post('/login', (req, res, next) => {
    User.find({email_address: req.body.email_address})
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed1'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth Failed2'
                    })
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email_address: user[0].email_address,
                            userId: user[0]._id
                        },
                        'mysecret',
                        {
                            expiresIn: '1h'
                        }
                    );
                    // console.log(token);
                    storage.setItem('token', token);
                    res.redirect('/orders');
                    // return res.status(200).json({
                    //     message: 'Auth successful',
                    //     token: token
                    // })
                } else {
                    res.status(401).json({
                            message: 'Auth Failed3'
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
})

router.delete('/:userId', (req, res, next) => {
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
});

module.exports = router;