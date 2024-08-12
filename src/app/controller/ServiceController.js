const db = require('../../config/db');
class ServiceController {
    async index(req, res) {
        const [prices] = await db.query(`
    select vehicle_type,
        FORMAT(base_fare, 0, 'de_DE') AS base_fare,
        FORMAT(fare_first_10km, 0, 'de_DE') AS fare_first_10km,
        FORMAT(fare_10_to_30km, 0, 'de_DE') AS fare_10_to_30km,
        FORMAT(fare_above_30km, 0, 'de_DE') AS fare_above_30km,
        FORMAT(waiting_time_fare, 0, 'de_DE') AS waiting_time_fare
    from taxi_pricing`);
        res.locals.prices = prices;
        res.render('service', { noSlider: true });
    }

    show(req, res) {
        res.render('service-detail');
    }
}

module.exports = new ServiceController();