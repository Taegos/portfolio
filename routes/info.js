var express = require('express');
var router = express.Router();
var requiresLogin = require('../middleware/session');
info = require('../models/info');

//Get user info
router.get('/', async function(req, res, next) {

    try {
        const docs = await info.find({});
        res.json(docs[0]).send();
    } catch (e) {
        next(e);
    }
});

//Update user info
router.put('/', requiresLogin, async function(req, res, next) {

    try {
        const doc = await info.findOneAndUpdate({}, req.body);
        if (doc === undefined) res.status(404).send();
        res.status(200).json(doc);
    } catch (e) {
        next(e);
    }
});

module.exports = router;