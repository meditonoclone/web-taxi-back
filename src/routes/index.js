const siteRoute = require('./site');
const aboutRoute = require('./about');
const serviceRoute = require('./service');
const newsRoute = require('./news');
function route(app){
    app.use('/news', newsRoute);

    app.use('/service', serviceRoute);

    app.use('/about', aboutRoute);
    
    app.use('/', siteRoute);

}

module.exports = route;