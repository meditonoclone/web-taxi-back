const mw = {
    setLocals(req, res, next) {
        res.locals.user = 'user' || null; 
        next();
    }
    
}

module.exports = mw;