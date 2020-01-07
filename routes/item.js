var express = require('express');
var router = express.Router();
var requiresLogin = require('../middleware/session');
var item = require('../models/item');


router.get('/', async function(req, res, next) {
    try {
        const docs = await item.find({}, {"long_desc" : 0});
        res.json(docs).send();
    } catch (e) {
        next(e);
    }
});


router.get('/:id', async function(req, res, next) {

    const id = req.params.id;

    try {
        const doc = await item.findById(id);
        if (doc === null) return res.status(404).send();
        res.json(doc).send();
    } catch (e) {
        next(e);
    }
});


router.post('/', requiresLogin, async function(req, res, next) {
    try {
        const doc = await item.create(req.body);
        res.status(201).json(doc);
    } catch (e) {
        next(e);
    }
});


router.put('/:id', requiresLogin, async function (req, res, next) {

    const id = req.params.id;

    try {
        const doc = await item.findOneAndUpdate({"_id" : id}, req.body, {new: true});
        if (doc === null) return res.status(404).send();
        res.json(doc).send();
    } catch (e) {
        next(e);
    }
});


router.delete('/:id', requiresLogin, async function(req, res, next) {

    const id = req.params.id;

    try {
        const info = await item.deleteOne({"_id" : id});
        if (info.deletedCount === 0) return res.status(404).send();
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

module.exports = router;