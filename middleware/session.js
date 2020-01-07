module.exports = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.status(401).send();
};