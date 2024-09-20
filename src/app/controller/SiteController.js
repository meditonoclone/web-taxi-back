const User = require('../model/User');
const session = require('express-session');
const db = require('../../config/db');
const News = require('../model/News');
const Trip = require('../model/Trip');
const setLocals = require('../../middleware');
const cookieSignature = require('cookie-signature');
const { Op } = require('sequelize');
const { resultToObject, validateUserData } = require('../../util/sequelize');
const clients = require('../../socket/clientsList');

class SiteController {
    async index(req, res) {
        const [vehicles] = await db.query(`SELECT vehicle_type_id, vehicle_type
                                             FROM taxi_pricing`);
        res.locals.vehicles = vehicles;
        const [prices] = await db.query(`
            select vehicle_type,
                FORMAT(base_fare, 0, 'de_DE') AS base_fare,
                FORMAT(fare_first_10km, 0, 'de_DE') AS fare_first_10km,
                FORMAT(fare_10_to_30km, 0, 'de_DE') AS fare_10_to_30km,
                FORMAT(fare_above_30km, 0, 'de_DE') AS fare_above_30km,
                FORMAT(waiting_time_fare, 0, 'de_DE') AS waiting_time_fare
            from taxi_pricing`);
        res.locals.prices = prices;
        let newNews;
        newNews = await News(db).findAll({
            limit: 3, order: [['published_date', 'DESC']]
        });
        newNews = await Promise.all(newNews.map(
            async (item, index) => {
                let thumbnail = await item.getImages();
                thumbnail = thumbnail.find(
                    (img) => img.position === 'thumbnail'
                );
                return ({ ...resultToObject(item, 'model'), ...thumbnail });
            }
        ));
        res.locals.news = newNews;
        res.render('home', { home: true, jsFiles: ['/js/validateInput.js', '/js/booking.js', "/socket.io/socket.io.js", "https://maps.googleapis.com/maps/api/js?key=AIzaSyBhCS8jbeI2pduvBwHQ_WeGPIURYveeNgs&libraries=places", "/js/map.js"] });
    }

    //GET page
    showLogin(req, res, next) {
        res.render('login', { cssFiles: ['/css/login.css'], noSlider: true, jsFiles: ['/js/validateInput.js', '/js/login.js', '/socket.io/socket.io.js'] });
    }

    //POST login account
    async login(req, res, next) {
        const { username, password, rememberMe } = req.body;
        let err;
        try {
            let user = await User(db).findOne({ where: { phone: username } });
            if (!user)
                err = 'Tài khoản không tồn tại!!!'
            else {

                user = await User(db).findOne({ where: { phone: username, password: password } });

                if (!user)
                    err = 'Mật khẩu không đúng!!!'
            }

            if (user && !err) {
                req.session.user = { userId: user.user_id.toString(), name: user.name, accountType: user.account_type, img: user.profile_picture, rememberMe };
                // setTimeout(()=>delete session.user, session.expires);
                const signedSessionId = cookieSignature.sign(req.session.user.userId, 'secret');
                if (rememberMe === 'on') {
                    res.cookie('userId', signedSessionId, {
                        httpOnly: true, // Không cho phép truy cập cookie bằng JavaScript
                        secure: true, // Chỉ gửi cookie qua HTTPS
                        maxAge: 180 * 60 * 1000 // Thời gian hết hạn của cookie là 30 phút (tính bằng mili giây)
                    });

                } else {
                    res.cookie('userId', signedSessionId, {
                        httpOnly: true, // Không cho phép truy cập cookie bằng JavaScript
                        secure: true, // Chỉ gửi cookie qua HTTPS
                    });
                }
                next();
                res.redirect('/');
            } else {
                req.flash('loginError', err);
                return res.redirect('/login');
            }
        } catch (e) {
            console.error('Error fetching user:', e);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }


    logout(req, res) {
        req.session.destroy((err) => {
            if (err) console.log(err);
            res.clearCookie();
            res.redirect('/login');
        });
    }
    //GET /sigup
    showSignup(req, res) {
        res.render('signup', {
            cssFiles: ['/css/signup.css', '/css/login.css'], noSlider: true,
            jsFiles: ['/js/validateInput.js', '/socket.io/socket.io.js', '/js/signup.js']
        });
    }

    //POST /sigup
    async signup(req, res) {
        try {
            const validatedData = validateUserData(req.body);
            const [user, created] = await User(db).findOrCreate({ where: validatedData });
            res.redirect('/login');
        } catch (error) {
            console.error('Error creating new user:', error);
        }

    }

    resetpass(req, res) {
        res.render('resetpass', { cssFiles: ['/css/resetpass.css', '/css/login.css'], noSlider: true });
    }

    contact(req, res) {
        res.render('contact', { noSlider: true });
    }

    chat(req, res) {
        res.render('chat');
    }

    //GET profile
    async account(req, res) {
        if (!res.locals.user)
            return res.redirect('/login');
        try {
            let info = await User(db).findByPk(res.locals.user.userId,
                {
                    attributes: { exclude: ['password'] }
                }
            );
            info = { ...info.dataValues };
            res.locals.info = info;
            if (info.account_type === 'client') {
                let [historyTrips] = await db.query(`
                    SELECT trip_id, order_time, taxi_pricing.vehicle_type, distance, waiting_minutes, cost, from_location, to_location, user.name, user.phone, trip_history.status
                    FROM trip_history
                    LEFT JOIN driver_profile ON trip_history.driver_id = driver_profile.user_id
                    LEFT JOIN user ON trip_history.driver_id = user.user_id
                    INNER JOIN taxi_pricing ON trip_history.vehicle_type_id = taxi_pricing.vehicle_type_id
                    WHERE trip_history.client_id = ${info.user_id}`);
                res.locals.historyTrips = historyTrips;
                const io = req.app.get('io');
                io.on('connection', sk => {
                    if (req.session.user.userId) {
                        clients.set(req.session.user.userId, sk.id);

                    }
                    sk.on('disconnect', () => {
                        clients.delete(req.session.user.userId);
                    });
                });
                res.render('account/clientProfile', {
                    noSlider: true, cssFiles: ['/css/account.css'],
                    jsFiles: ['/socket.io/socket.io.js', '/js/clientAccount.js']
                });
            } else if (info.account_type === 'driver') {
                const io = req.app.get('io');
                io.on('connection', sk => {
                    sk.join(req.session.user.accountType);
                });

                let [newTrips] = await db.query(`
                    SELECT trip_id,order_time, from_location, to_location, contact, status, user.name 
                    FROM trip_history left join user on client_id = user.user_id 
                    WHERE status = 'booked';`);
                res.locals.newTrips = newTrips.length > 0 ? newTrips : null;
                let [historyTrips] = await db.query(`
                    SELECT trip_id, order_time, distance, waiting_minutes, cost, from_location, to_location, user.name, user.phone, trip_history.finished_time, trip_history.status
                    FROM trip_history
                    LEFT JOIN user ON trip_history.client_id = user.user_id
                    WHERE trip_history.driver_id = ${info.user_id}`);
                res.locals.historyTrips = historyTrips.length > 0 ? historyTrips : null;
                res.render('account/driverProfile', {
                    noSlider: true,
                    cssFiles: ['/css/account.css', '/css/driverProfile.css'],
                    jsFiles: ['/socket.io/socket.io.js', '/js/driverAccount.js']
                });

            } else {
                console.log('tài khoản admin');
                return res.redirect('/login');
            }

        } catch (err) {
            console.error('Error get infomation:', err);

        }
    }
    //POST delete trip client
    async deleteTrip(req, res) {
        try {
            const { tripId } = req.body;
            const trip = await Trip(db).findOne({
                where: {
                    trip_id: parseInt(tripId),
                    client_id: req.session.user.userId
                }
            });
            if (!trip) {
                res.status(200).json('fail find trip');
                return;
            }
            await trip.destroy();
            res.status(200).json('success');

        } catch (err) {
            res.status(200).json('fail');
        }

    }
    //POST driver accept trip
    async acceptTrip(req, res) {
        try {
            const io = req.app.get('io');
            const { tripId } = req.body;
            const trip = await Trip(db).findOne({
                where: {
                    trip_id: parseInt(tripId),
                    status: 'booked'
                }
            });
            if (!trip) {
                res.status(200).json('fail find trip');
                return;
            }
            trip.status = 'en route';
            trip.driver_id = req.session.user.userId;
            trip.save();
            if (clients.has(trip.client_id.toString()))
                io.to(clients.get(trip.client_id.toString())).emit('update data', trip.trip_id);
            io.to('driver').emit('update data', true);
            res.status(200).json('success');
        } catch (err) {
            res.status(200).json('fail');
        }
    }

    //get newtrips for driver
    async getNewTrips(req, res) {
        if (req.session.user.accountType !== 'driver') {
            return res.status(200).json('no control');
        }
        try {
            let [newTrips] = await db.query(`
                SELECT trip_id,order_time, from_location, to_location, contact, status, user.name 
                FROM trip_history left join user on client_id = user.user_id 
                WHERE status = 'booked';`);
            res.status(200).json(newTrips);
        } catch (err) {
            console.error('Error get new trips:', err);
            res.status(200).json('fail');
        }
    }

    // get history trips for client
    async getHistoryTrips(req, res) {
        try {
            let [historyTrips] = await db.query(`
                SELECT trip_id, order_time, taxi_pricing.vehicle_type, distance, waiting_minutes, cost, from_location, to_location, user.name, user.phone, trip_history.status
                FROM trip_history
                LEFT JOIN driver_profile ON trip_history.driver_id = driver_profile.user_id
                LEFT JOIN user ON trip_history.driver_id = user.user_id
                INNER JOIN taxi_pricing ON trip_history.vehicle_type_id = taxi_pricing.vehicle_type_id
                WHERE trip_history.client_id = ${req.session.user.userId}`);
            console.log(historyTrips, )
            res.status(200).json(historyTrips, req.session.user.userId);
            } catch (err) {
            console.error('Error get history trips:', err);
            res.status(200).json('fail');
        }
    }

    //POST booking
    async booking(req, res) {

        try {
            const trip = await Trip(db).create({
                client_id: !res.locals.user ? null : res.locals.user.userId,
                vehicle_type_id: req.body.vehicleType,
                from_location: req.body.start,
                to_location: req.body.end,
                contact: req.body.phone,
                order_time: new Date(),
            });
            res.redirect('account');
        } catch (err) {
            console.error('Error booking:', err);
        }
    }
}

module.exports = new SiteController();