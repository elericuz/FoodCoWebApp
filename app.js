const morgan = require('morgan');
const express = require('express');
const Item = require('./api/models/items');
const moment = require('moment');
const lodash = require('lodash');

// App
const app = express();

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

app.get('/show-items', (req, res, next) => {
    const item = new Item({
        name: 'apple',
        code: '1234'
    })

    item.save()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/item/:id', (req, res, next) => {
    Item.findById(req.params.id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});

//static files
app.use(express.static('public'));

//urlencode
app.use(express.urlencoded({ extended: true }));

const HomeController = require('./api/controllers/home')
app.get('/', HomeController.index)
app.get('/dashboard', HomeController.dashboard);

// orders routes
const orderRoutes = require('./api/routes/orders');
app.use('/orders', orderRoutes);


const productRoutes = require('./api/routes/products');
app.use('/products', productRoutes);


// error page
app.use((req, res) => {
    res.status(404).render('404')
})

module.exports = app;
