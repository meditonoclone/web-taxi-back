const mw = {
    setLocals(req, res, next, user) {
        res.locals.user = 'user' || null; 
        next();
    }

}

module.exports = mw;