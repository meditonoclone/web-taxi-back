class NewsController{
    index(req, res){
        res.render('news', {noSlider: true});
    }
    show(req, res){
        res.render('news-detail');
    }
}

module.exports = new NewsController();