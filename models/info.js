var mongoose = require('mongoose');

var schema = mongoose.Schema({
    short_intro: String,
    long_intro: String,
    email: String,
    image_url: String
});

module.exports = mongoose.model('Info', schema, "info");