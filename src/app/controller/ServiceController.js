class ServiceController {
    index(req,  res){
        res.render('service', { noSlider: true});
    }

    show(req, res){
        res.render('service-detail');
    }
}

module.exports = new ServiceController();