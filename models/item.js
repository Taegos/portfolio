var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
    title: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
    long_desc: String,
    short_desc: String,
    tags: [String],
    image_url: String
});

module.exports = mongoose.model('Item', itemSchema, "item");