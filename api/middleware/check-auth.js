const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.userToken;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token, process.env.JWT_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/');
            } else {
                next();
            }
        });
    } else {
        res.redirect('/');
    }
 };