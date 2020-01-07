const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const sessionAPI = require('./routes/session');
const itemAPI = require('./routes/item');
const credentialsAPI = require('./routes/credentials');
const infoAPI = require('./routes/info');

var app = express();

mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true})
    .catch(error => { throw error;});
mongoose.Promise = global.Promise;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    name: 'sid',
    secret: 'asdfqwert',
    cookie: {
        maxAge: 1000 * 3600 * 2,
        secure: false,
        httpOnly: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }) //fixa env
    }
}));

app.use('/item', itemAPI);
app.use('/session', sessionAPI);
app.use('/credentials', credentialsAPI);
app.use('/info', infoAPI);

app.use( (err, req, res, next) => {

    console.error(err.stack);
    if (err instanceof mongoose.CastError) return res.status(400).send();
   // if (err instanceof mongoose.ValidationError) return res.status(400).send();
    res.status(500).send();
});

module.exports = app;
