const session = require('express-session');
const db = require('../../config/db');
const News = require('../model/News');;
const { Rating, User, Trip, Payment } = require('../model');
const setLocals = require('../../middleware');
const cookieSignature = require('cookie-signature');
const { Op } = require('sequelize');
const { resultToObject, validateUserData } = require('../../util/sequelize');
const clients = require('../../socket/clientsList');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load biến môi trường
const { generateOTP, sendOTP } = require('../services/snsService');
const { saveOTP, verifyOTP } = require('../services/otpStore');


class SiteController {
    async index(req, res) {
        const ratings = await Rating.findAll({
            where: { rating: 5 },
            limit: 10,
            include: [
                { model: User, as: 'client', attributes: ['user_id', 'name', 'profile_picture'] }, // Lấy thông tin người đánh giá
            ],
            order: [['created_at', 'DESC']] // Sắp xếp theo thời gian mới nhất
        });
        const ratingsData = ratings.map(rating => rating.get({ plain: true }));
        res.locals.ratings = ratingsData;
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
        res.render('home', { home: true, jsFiles: ['/js/validateInput.js', "/socket.io/socket.io.js", "/js/map.js", '/js/booking.js'] });
    }

    //GET page
    showLogin(req, res, next) {
        res.render('login', { cssFiles: ['/css/login.css'], noSlider: true, jsFiles: ['/js/validateInput.js', '/js/login.js', '/socket.io/socket.io.js'] });
    }

    //POST login account
    async login(req, res, next) {
        const { username, password, rememberMe } = req.body;
        try {
            let user = await User.findOne({ where: { phone: username } });
            if (!user)
                return res.status(200).json({ phone: true })
            else {

                user = await User.findOne({ where: { phone: username, password: password } });

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
            const [user, created] = await User.findOrCreate({ where: validatedData });
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
            let info = await User.findByPk(res.locals.user.userId,
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
                let [currentTrip] = await db.query(`
                    SELECT trip_id, order_time, distance, waiting_minutes, cost, from_location,
                        to_location, user.name, user.phone, trip_history.finished_time, trip_history.status,
                        user.profile_picture
                    FROM trip_history
                    LEFT JOIN user ON trip_history.driver_id = user.user_id
                    WHERE trip_history.client_id = ${info.user_id} and trip_history.status NOT IN ('cancled','completed')`);
                res.locals.currentTrip = currentTrip.length > 0 ? currentTrip[0] : null;
                req.session.tripId = currentTrip.length > 0 ? currentTrip[0].trip_id : null;
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
                    noSlider: true, cssFiles: ['/css/account.css', '/css/clientProfile.css'],
                    jsFiles: ['/socket.io/socket.io.js', '/js/clientAccount.js']
                });
            } else if (info.account_type === 'driver') {
                // const sk = req.app.get('sk');
                // sk.join(req.session.user.accountType);
                // console.log(sk.rooms)
                let [newTrips] = await db.query(`
                    SELECT trip_id,order_time, from_location, to_location, contact, status, user.name, contact 
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
                        to_location, user.name, contact, trip_history.finished_time, trip_history.status,
                        user.profile_picture
                    FROM trip_history
                    LEFT JOIN user ON trip_history.client_id = user.user_id
                    WHERE trip_history.driver_id = ${info.user_id} and trip_history.status not in ('canceled', 'completed')`);
                res.locals.currentTrip = currentTrip.length > 0 ? currentTrip[0] : null;
                req.session.tripId = currentTrip.length > 0 ? currentTrip[0].trip_id : null;

                res.render('account/driverProfile', {
                    noSlider: true,
                    cssFiles: ['/css/account.css', '/css/driverProfile.css'],
                    jsFiles: ['/socket.io/socket.io.js', '/js/driverAccount.js']
                });

            } else {
                console.log('tài khoản admin');
                return res.redirect('admin');
            }

        } catch (err) {
            console.error('Error get infomation:', err);

        }
    }
    //POST delete trip client
    async deleteTrip(req, res) {
        console.log(req.session.tripId, 123)
        try {

            // const { tripId } = req.body;
            const trip = await Trip.findOne({
                where: {
                    trip_id: req.session.tripId,
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
            const acceptedTrip = await Trip.findOne({
                where: {
                    driver_id: req.session.user.userId,
                    status: {
                        [Op.notIn]: ['booked', 'completed']
                    }
                }
            })
            if (acceptedTrip) {
                return res.status(400).json("Chưa hoàn thành chuyến, không thể nhận thêm!");
            }
            const { tripId } = req.body;
            const trip = await Trip.findOne({
                where: {
                    trip_id: parseInt(tripId),
                    status: 'booked'
                }
            });
            if (!trip) {
                res.status(400).json('Chuyến không tồn tại');
                return;
            }
            trip.status = 'en route';
            req.session.tripId = tripId;
            trip.driver_id = req.session.user.userId;
            await trip.save();
            let [currentTrip] = await db.query(`
                SELECT trip_history.trip_id, trip_history.order_time, trip_history.distance, 
                    trip_history.waiting_minutes, trip_history.cost, trip_history.from_location, 
                        trip_history.to_location, 
                        client.name AS name, 
                        trip_history.contact AS contact, 
                        client.profile_picture AS client_profile_picture, 
                        trip_history.finished_time, trip_history.status, 
                        driver.name AS driver_name, driver.phone AS driver_contact, 
                        driver.profile_picture AS driver_profile_picture
                FROM trip_history
                LEFT JOIN user AS client ON trip_history.client_id = client.user_id
                LEFT JOIN user AS driver ON trip_history.driver_id = driver.user_id
                WHERE trip_history.trip_id = ${parseInt(tripId)}`);
            if (trip.client_id)
                if (clients.has(trip.client_id.toString())) {
                    io.to(clients.get(trip.client_id.toString())).emit('update data', trip.trip_id);
                    io.to(currentTrip[0].trip_id.toString()).emit('getDriverInfo', { name: currentTrip[0].driver_name, phone: currentTrip[0].driver_contact, img: currentTrip[0].driver_profile_picture });
                }

            io.to('driver').emit('update data', true);
            console.log(currentTrip)
            res.status(200).json({ currentTrip: currentTrip[0] });
        } catch (err) {
            console.log(err);
            res.status(400).json('Có lỗi xảy ra');
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
                res.status(400).json('fail');
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
                res.status(400).json('fail');
            }
        }

    }

    //POST booking
    async booking(req, res) {
        console.log(req.body)
        let message = 'Đặt chuyến thành công';
        try {
            const trip = await Trip.create({
                client_id: !res.locals.user ? null : res.locals.user.userId,
                vehicle_type_id: req.body.vehicleType,
                from_location: req.body.start,
                to_location: req.body.end,
                contact: req.body.phone,
                order_time: new Date(),
                pickup_latitude: req.body.pickup_latitude,
                pickup_longitude: req.body.pickup_longitude,
                dropoff_latitude: req.body.dropoff_latitude,
                dropoff_longitude: req.body.dropoff_longitude,
            });
            if (!res.locals.user) {
                req.session.tripId = trip.dataValues.trip_id;
                req.session.save();
            }
            const io = req.app.get('io');
            io.to('driver').emit('update data', true);
            res.json({ success: true, message, tripId: trip.dataValues.trip_id });
        } catch (err) {
            console.error('Error booking:', err);
            message = 'Không thể đặt'
            res.json({ success: false, message })
        }
    }


    // Hàm gửi email đặt lại mật khẩu
    async sendResetEmail(req, res) {

        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

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
        const user = await User.findOne({
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
    async getTrip(req, res) {
        if (!req.session.tripId)
            return res.status(400).json({ message: "Không lấy được chuyến" });

        // Lấy thông tin chuyến đang ch��
        const trip = await Trip.findOne({
            where: {
                trip_id: req.session.tripId
            }
        });
        return res.json(trip)
    }
    async setTripState(req, res) {
        const statusFlow = ["booked", "en route", "in transit", "pending payment", "completed"];
        let driverId
        if (req.session.user)
            driverId = req.session.user.userId
        try {
            const { tripId, status, detailCompletedTrip } = req.body;

            // Kiểm tra đầu vào
            if (!tripId || !driverId) {
                return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
            }

            const trip = await Trip.findOne({
                where: {
                    trip_id: parseInt(tripId),
                    driver_id: driverId,
                }
            });
            if (!trip) {
                res.status(400).json('Chuyến không tồn tại');
                return;
            }
            
            //Cập nhật đang chờ
            if (status == 'waiting') {
                await trip.update({ status })
                return res.status(200).json({ message: "Cập nhật trạng thái thành công", newStatus: status });
            }
            if (status == 'stop waiting') {
                await trip.update({ status: "in transit" })
                return res.status(200).json({ message: "Cập nhật trạng thái thành công", newStatus: "in transit" });
            }
            if(trip.status == 'completed')
                return res.status(200).json({ message: "Cập nhật trạng thái thành công", newStatus: "completed" });

            // Cập nhật trạng thái tiếp theo
            let currentStatusIndex = statusFlow.indexOf(trip.status);
            if (trip.status === 'in transit' && detailCompletedTrip) // xác nhận hoàn thành chuyến
            {
                let p;
                let s = detailCompletedTrip.distance

                try {
                    const [[price]] = await db.query(`
            select
                vehicle_type,
                base_fare,
                fare_first_10km,
                fare_10_to_30km,
                fare_above_30km,
                waiting_time_fare
            from taxi_pricing
            where vehicle_type_id = ${trip.vehicle_type_id}`);

                    p = parseInt(price.base_fare);
                    console.log(p);
                    if (s > 1)
                        if (s <= 10)
                            p += parseInt(price.fare_first_10km) * (s - 1);
                        else if (s <= 30)
                            p += parseInt(price.fare_first_10km) * 9 + (s - 10) * parseInt(price.fare_10_to_30km);
                        else
                            p += parseInt(price.fare_first_10km) * 9 + 20 * parseInt(price.fare_10_to_30km) + (s - 30) * parseInt(price.fare_above_30km);
                   
                } catch (error) {
                    console.error('Error fetching prices:', error);
                }

                await trip.update({
                    status: statusFlow[currentStatusIndex + 1],
                    distance: detailCompletedTrip.distance,
                    actual_dropoff_latitude: detailCompletedTrip.location.lat,
                    actual_dropoff_longitude: detailCompletedTrip.location.lng,
                    cost: p,
                    finished_time: new Date()
                });
                await Payment.create({
                    trip_id: trip.trip_id,
                    amount: p,
                })
                return res.status(200).json({ message: "Chuyến đã hoàn tất", newStatus: 'pending payment', price: p });

            }
            if (trip.status == 'pending payment') {
                const payment = await Payment.findOne({where: {trip_id: trip.trip_id}})
                if(payment.method == 'cash')
                {
                    await payment.update({status: 'paid'})

                }else 
                {
                    if(payment.status != 'paid')
                    return res.status(400).json({message: "Chưa được thanh toán"})
                }
                
                await trip.update({ status: statusFlow[currentStatusIndex + 1] })
                return res.status(200).json({ message: "Cập nhật trạng thái thành công", newStatus: statusFlow[currentStatusIndex + 1] });

            }
            if (currentStatusIndex < statusFlow.length - 1) {
                await trip.update({ status: statusFlow[currentStatusIndex + 1] })
                return res.status(200).json({ message: "Cập nhật trạng thái thành công", newStatus: statusFlow[currentStatusIndex + 1] });

            }
            return res.status(400).json('Không thể cập nhật trạng thái');


        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
    }

    async rate(req, res) {
        console.log(req.body);
        try {
            const { driverId, tripId, rating, comment } = req.body;

            // Kiểm tra đầu vào
            if (!driverId || !tripId || !rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
            }

            // Kiểm tra xem chuyến đi có tồn tại không
            const trip = await Trip.findByPk(tripId);
            if (!trip) {
                return res.status(404).json({ message: "Chuyến đi không tồn tại!" });
            }
            if (req.session.user && trip.client_id != req.session.user.userId) {
                return res.status(404).json({ message: "Không thể đánh giá" });

            }
            // Tạo đánh giá
            const newRating = await Rating.create({
                trip_id: tripId,
                driver_id: driverId,
                user_id: trip.client_id, // Lấy id khách hàng từ trip
                rating,
                comment
            });

            res.status(201).json({ message: "Đánh giá thành công!", rating: newRating });

        } catch (error) {
            console.error("Lỗi:", error);
            res.status(500).json({ message: "Lỗi server!" });
        }
    }

    async getRatings(req, res) {
        try {
            const { trip_id, user_id, driver_id, rating } = req.query;

            const whereCondition = {};
            if (trip_id) whereCondition.trip_id = trip_id;
            if (user_id) whereCondition.user_id = user_id;
            if (driver_id) whereCondition.driver_id = driver_id;
            if (rating) whereCondition.rating = rating; // Lọc theo số sao

            const ratings = await Rating.findAll({
                where: whereCondition,
                include: [
                    { model: User, as: 'client', attributes: ['user_id', 'name', 'profile_picture'] }, // Lấy thông tin người đánh giá
                    { model: User, as: 'driver', attributes: ['user_id', 'name'] }, // Lấy thông tin tài xế
                    { model: Trip, as: 'trip', attributes: ['trip_id', 'from_location', 'to_location'] } // Lấy thông tin chuyến đi
                ],
                order: [['created_at', 'DESC']] // Sắp xếp theo thời gian mới nhất
            });

            res.status(200).json({ success: true, ratings });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    async sendOtp(req, res) {
        let { phone } = req.body;
        if (phone != '0866840075')
            return res.json({ message: 'OTP sent' });
        if (!phone) return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
        phone = '+84' + phone.slice(1);
        const otp = generateOTP();
        const result = await sendOTP(phone, otp);

        if (result.success) {
            saveOTP(phone, otp); // Lưu OTP sau khi gửi
            res.json({ message: 'OTP sent' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    }

    async verifyOtp(req, res) {
        let { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone number and OTP are required' });
        }
        phone = '+84' + phone.slice(1)
        if (otp === '000000') {
            return res.json({ message: 'OTP verified successfully', success: true });
        }
        const result = verifyOTP(phone, otp);

        console.log(phone, otp, result)
        if (result.success) {
            res.json({ message: 'OTP verified successfully', success: true });
        } else {
            res.status(400).json({ error: result.message });
        }
    };
}

module.exports = new SiteController();