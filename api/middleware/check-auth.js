const _ = require('lodash');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.userToken;
    let adminUser = false;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
            if (err) {
                res.redirect('/');
            } else {
                const userType = await User.findById(decodedToken.userId)
                    .select('type_id -_id')
                    .populate({
                        path: 'type_id',
                        model: 'UserTypes',
                        select: 'name -_id'
                    })
                    .then(result => { return result.type_id.name; })
                    .catch(err => console.log(err));

                req.userType = userType;
                req.admin = false;

                if (_.lowerCase(userType) === _.lowerCase('admin') ||
                    _.lowerCase(userType) === _.lowerCase('seller') ||
                    _.lowerCase(userType) === _.lowerCase('manager') ||
                    _.lowerCase(userType) === _.lowerCase('supervisor') ||
                    _.lowerCase(userType) === _.lowerCase('developer')) {
                    adminUser = true;
                    req.admin = true;
                }

                res.locals.adminUser = adminUser;

                next();
            }
        });
    } else {
        res.redirect('/');
    }
 };