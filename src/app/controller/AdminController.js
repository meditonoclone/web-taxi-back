class AdminController{
    index(req, res){
        res.render('admin/home',{layout: 'admin', jsFiles: ['/js/admin/dashboard.js']});
    }
    showTrips(req, res){
        res.render('admin/trips',{layout: 'admin', jsFiles: ['/js/admin/trips.js']});
    }
    showAccount(req, res){
        res.render('admin/account', {layout: 'admin', jsFiles: ['/js/admin/account.js']})
    }
}

module.exports = new AdminController();