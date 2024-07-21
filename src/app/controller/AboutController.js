class AboutController{
    index(req, res){
        res.render('about', {home: true});
    }
    show(req, res){
        res.render('about-detail');
    }
}

module.exports = new AboutController();