const User = require('../models/users');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.userToken;

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

                next();
            }
        });
    } else {
        res.redirect('/');
    }
 };