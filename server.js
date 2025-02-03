'use strict';

// Constants
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.DEFAULT_PORT;
const HOST = process.env.DEFAULT_HOST;

const server = http.createServer(app);

// connect mongodb
mongoose.set('allowDiskUse', true);

let dbUri = "mongodb://" + process.env.MONGO_USER + ":" + encodeURIComponent(process.env.MONGO_PASSWORD) + "@" + process.env.MONGO_SERVER + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB + "?retryWrites=true&w=majority"
if (process.env.ENVIRONMENT=="DEVELOPMENT") {
    dbUri = "mongodb+srv://" + process.env.MONGO_USER_DEV + ":" + encodeURIComponent(process.env.MONGO_PASSWORD_DEV) + "@" + process.env.MONGO_SERVER_DEV + "/" + process.env.MONGO_DB_DEV + "?retryWrites=true&w=majority&appName=Cluster0"
}
console.log(dbUri)
mongoose.connect(dbUri, {})
    .then((result) => server.listen(PORT, HOST))
    .catch((err) => console.log(err));

console.log(`Running on http://${HOST}:${PORT}`);