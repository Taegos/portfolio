const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const credentials = require('../models/credentials');

router.post('/', async function(req, res, next) {

    const password = req.body.password;

    try {
        const docs = await credentials.find({});
        if (docs.length === 0) return res.status(404).send();

        const hash = docs[0].hash;
        const success = await bcrypt.compare(password, hash);
        if (!success) return res.status(401).send();

        req.session.isLoggedIn = true;
        return res.status(201).send();
    } catch (e) {
        next(e);
    }
});

router.delete('/', async function(req, res, next) {

    if (!req.session.isLoggedIn) return res.status(404).send();

    try {
        await req.session.destroy();
        res.isLoggedIn = false;
        res.clearCookie('sid');
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

module.exports = router;