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

const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
        try {
            let user = await User(db).findOne({ where: { phone: username } });
            if (!user)
                return res.status(200).json({ phone: true })
            else {

                user = await User(db).findOne({ where: { phone: username, password: password } });

                if (!user)
                    return res.status(200).json({ pass: true })

            }

            if (user) {
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
                res.status(200).json('');
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

                let [currentTrip] = await db.query(`
                    SELECT trip_id, order_time, distance, waiting_minutes, cost, from_location,
                        to_location, user.name, user.phone, trip_history.finished_time, trip_history.status,
                        user.profile_picture
                    FROM trip_history
                    LEFT JOIN user ON trip_history.client_id = user.user_id
                    WHERE trip_history.driver_id = ${info.user_id} and trip_history.status = 'en route'`);
                res.locals.currentTrip = currentTrip.length > 0 ? currentTrip[0] : null;

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
            const acceptedTrip = await Trip(db).findOne({
                where: {
                    driver_id: req.session.user.userId,
                    status: {
                        [Op.notIn]: ['booked', 'complete']
                    }
                }
            })
            if (acceptedTrip) {
                return res.status(200).json("Chưa hoàn thành chuyến, không thể nhận thêm!");
            }
            const { tripId } = req.body;
            const trip = await Trip(db).findOne({
                where: {
                    trip_id: parseInt(tripId),
                    status: 'booked'
                }
            });
            if (!trip) {
                res.status(200).json('Chuyến không tồn tại');
                return;
            }
            trip.status = 'en route';
            trip.driver_id = req.session.user.userId;
            trip.save();
            if (trip.client_id)
                if (clients.has(trip.client_id.toString()))
                    io.to(clients.get(trip.client_id.toString())).emit('update data', trip.trip_id);
            io.to('driver').emit('update data', true);
            res.status(200).json('success');
        } catch (err) {
            console.log(err);
            res.status(200).json('Có lỗi xảy ra');
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
            console.log(newTrips)
            res.status(200).json(newTrips);
        } catch (err) {
            console.error('Error get new trips:', err);
            res.status(200).json('fail');
        }
    }

    // get history trips for client and driver
    async getHistoryTrips(req, res) {
        if (!req.session.user)
            return
        if (req.session.user.accountType == 'client') {
            try {
                let [historyTrips] = await db.query(`
                SELECT trip_id, order_time, taxi_pricing.vehicle_type, distance, waiting_minutes, cost, from_location, to_location, user.name, user.phone, trip_history.status
                FROM trip_history
                LEFT JOIN driver_profile ON trip_history.driver_id = driver_profile.user_id
                LEFT JOIN user ON trip_history.driver_id = user.user_id
                INNER JOIN taxi_pricing ON trip_history.vehicle_type_id = taxi_pricing.vehicle_type_id
                WHERE trip_history.client_id = ${req.session.user.userId}`);

                res.status(200).json(historyTrips);
            } catch (err) {
                console.error('Error get history trips:', err);
                res.status(200).json('fail');
            }
        }
        if (req.session.user.accountType == 'driver') {
            try {
                let [historyTrips] = await db.query(`
                    SELECT trip_id, order_time, distance, waiting_minutes, cost, from_location, to_location, user.name, user.phone, trip_history.finished_time, trip_history.status
                    FROM trip_history
                    LEFT JOIN user ON trip_history.client_id = user.user_id
                    WHERE trip_history.driver_id = ${req.session.user.userId}`);
                res.status(200).json(historyTrips);
            } catch (err) {
                console.error('Error get new trips:', err);
                res.status(200).json('fail');
            }
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
            const io = req.app.get('io');
            io.to('driver').emit('update data', true);
            res.redirect('account');
        } catch (err) {
            console.error('Error booking:', err);
        }
    }


    // Hàm gửi email đặt lại mật khẩu
    async sendResetEmail(req, res) {

        const { email } = req.body;
        const user = await User(db).findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ notExist: true });
        }

        // Tạo token
        const token = crypto.randomBytes(20).toString('hex');

        // Lưu token và thời gian hết hạn (1 giờ)
        user.reset_password_token = token;
        user.token_expires = Date.now() + 3600000; // 1 giờ
        await user.save();

        // Gửi email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'devmail172.it@gmail.com',
                pass: 'wxhs domp isbs ekoh',
            },
        });

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const mailOptions = {
            from: 'devmail172.it@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Lỗi gửi email.', error: error });
            } else {
                return res.status(200).json({ success: true });
            }
        });


    };

    //GET create new password
    createNewPassword(req, res) {
        res.render('createNewPassword', {
            cssFiles: ['/css/resetpass.css', '/css/login.css'],
            jsFiles: ['/js/validateInput.js', '/socket.io/socket.io.js', '/js/createNewPassword.js'],
            noSlider: true
        });
    }

    //POST Hàm xử lý đặt lại mật khẩu
    async resetPassword(req, res) {
        const { token } = req.params;
        const { password } = req.body;

        // Tìm người dùng có token hợp lệ và chưa hết hạn
        const user = await User(db).findOne({
            where: {
                reset_password_token: token,
                token_expires: { [Op.gt]: Date.now() }  // Kiểm tra thời gian hết hạn
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Yêu cầu không hợp lệ hoặc đã hết hạn! Gửi lại yêu cầu' });
        }

        // Cập nhật mật khẩu mới
        user.password = password;
        user.reset_password_token = null;
        user.token_expires = null;
        await user.save();

        res.status(200).json({ message: 'Đặt lại mật khẩu thành công!', success: true });
    };


}

module.exports = new SiteController();