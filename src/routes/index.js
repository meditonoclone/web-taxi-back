const siteRoute = require('./site');
const aboutRoute = require('./about');
const serviceRoute = require('./service');
const newsRoute = require('./news');
const adminRoute = require('./admin');
const paymentRoute = require('./payment');
function route(app){
    app.use('/news', newsRoute);

    app.use('/service', serviceRoute);

    app.use('/about', aboutRoute);
    
    app.use('/admin', adminRoute);

    app.use('/payment', paymentRoute);

    app.use('/', siteRoute);

}

module.exports = route;