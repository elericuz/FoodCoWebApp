const morgan = require('morgan');
const express = require('express');
const moment = require('moment');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const checkAuth = require('./api/middleware/check-auth');

// App
const app = express();

app.use(cookieParser());

// ejs as view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/api/views/');

// morgan to log
app.use(morgan('dev'));

// moment as middleware
app.use((req, res, next) => {
    res.locals.moment = moment;
    res.locals._ = lodash;
    next();
})

// token to the whole site
app.use((req, res, next) => {
    let token = req.cookies.userToken;
    if (!lodash.isUndefined(token) && !lodash.isNull(token)) {
        let tokenDecoded = jwt.decode(token);
        res.locals.user = {
            name: tokenDecoded.name + " " + tokenDecoded.lastname,
            email_address: tokenDecoded.email_address
        };
    }
    next();
})

//static files
app.use(express.static('public'));

//urlencode
app.use(express.urlencoded({ extended: true }));

const HomeController = require('./api/controllers/home')
app.get('/', HomeController.index)
app.get('/dashboard', checkAuth, HomeController.dashboard);

const userRoutes = require('./api/routes/user');
app.use('/user', userRoutes);

// orders routes
const orderRoutes = require('./api/routes/orders');
app.use('/orders', orderRoutes);

// invoices routes
const invoicesRoutes = require('./api/routes/invoices');
app.use('/invoices', invoicesRoutes);

const productRoutes = require('./api/routes/products');
app.use('/products', productRoutes);

const providerRoutes = require('./api/routes/providers');
app.use('/providers', providerRoutes);

const clientRoutes = require('./api/routes/clients');
app.use('/clients', clientRoutes);

const warehouseRoutes = require('./api/routes/warehouses');
app.use('/warehouses', warehouseRoutes);

// error page
app.use((req, res) => {
    res.status(404).render('404')
})

module.exports = app;
