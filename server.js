'use strict';

// Constants
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = 8080;
const HOST = '0.0.0.0';

const server = http.createServer(app);

// connect mongodb
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const dbUri = "mongodb+srv://foodCo:" + process.env.MONGO_ATLAS_PW + "@cluster0.zlz63.mongodb.net/foodCo-db?retryWrites=true&w=majority"
mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => server.listen(PORT, HOST))
    .catch((err) => console.log(err));

console.log(`Running on http://${HOST}:${PORT}`);

