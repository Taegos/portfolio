var mongoose = require('mongoose');
Credentials = require('../../models/credentials');
var bcrypt = require('bcryptjs');

var data = require('./test-data');
var hash = bcrypt.hashSync(data.password,  bcrypt.genSaltSync(10));

async function finnish() {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
}

async function reset() {
    await mongoose.connection.dropDatabase();
    var credenials = new Credentials({ hash: hash});
    await credenials.save();
}

async function connect() {
    await mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true});
}

module.exports = {
    connect: connect,
    reset: reset,
    finnish: finnish,
};