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

let dbUri = "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_ATLAS_PW + "@" + process.env.MONGO_SERVER + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB + "?retryWrites=true&w=majority"
if (process.env.ENVIRONMENT=="DEVELOPMENT") {
    dbUri = "mongodb+srv://" + process.env.MONGO_USER_DEV + ":" + process.env.MONGO_PASSWORD_DEV + "@" + process.env.MONGO_SERVER_DEV + "/" + process.env.MONGO_DB_DEV + "?retryWrites=true&w=majority"
}
mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => server.listen(PORT, HOST))
    .catch((err) => console.log(err));

console.log(`Running on http://${HOST}:${PORT}`);

