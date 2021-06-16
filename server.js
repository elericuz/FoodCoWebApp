'use strict';

// Constants
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = 8080;
const HOST = '0.0.0.0';

const server = http.createServer(app);

// connect mongodb
const dbUri = "mongodb+srv://foodCo:mWPxH5LPi9L2M98b@cluster0.zlz63.mongodb.net/foodCo-db?retryWrites=true&w=majority"
mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => server.listen(PORT, HOST))
    .catch((err) => console.log(err));

console.log(`Running on http://${HOST}:${PORT}`);

