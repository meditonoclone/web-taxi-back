class SiteController{
    index(req, res){
        res.render('home', {home: true});
    }

    login(req, res){
        res.render('login', {cssFiles: ['login.css'], noSlider: true});
    }

    signup(req, res){
        res.render('signup', {cssFiles: ['signup.css', 'login.css'], noSlider: true});
    }

    resetpass(req, res){
        res.render('resetpass', {cssFiles: ['resetpass.css', 'login.css'], noSlider: true});
    }

    contact(req, res){
        res.render('contact', {noSlider: true});
    }
}

module.exports = new SiteController();