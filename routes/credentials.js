const express = require('express');
const router = express.Router();
const requiresLogin = require('../middleware/session');
const bcrypt = require('bcryptjs');
const credentials = require('../models/credentials');

router.put('/', requiresLogin, async function(req, res, next) {

    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;

    if (newPassword.length < 8) return res.status(400).send();

    try {
        const docs = await credentials.find({});
        if (docs.length === 0) return res.status(404).send();

        const oldHash = docs[0].hash;
        const success =  await bcrypt.compare(oldPassword, oldHash);
        if (!success) return res.status(401).send();

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        await credentials.findOneAndUpdate({}, { hash: newHash });
        res.status(200).send();
    } catch (e) {
        next(e);
    }
});

module.exports = router;