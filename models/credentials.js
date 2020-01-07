var mongoose = require('mongoose');

var schema = mongoose.Schema({
    hash: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Credentials', schema, "credentials");