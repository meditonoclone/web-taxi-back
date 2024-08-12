const User = require('../model/User');
const session = require('express-session');
const db = require('../../config/db');
const News = require('../model/News');
const setLocals = require('../../middleware');
const cookieSignature = require('cookie-signature');
const { Op } = require('sequelize');
const { resultToObject, validateUserData } = require('../../util/sequelize');

class SiteController {
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
        let newNews;
        newNews = await News(db).findAll({
            limit: 3, where: {
                published_date: { [Op.gte]: new Date(new Date() - 3 * 24 * 60 * 60 * 1000) }
            }, order: [['published_date', 'DESC']]
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
        res.render('home', { home: true });
    }

    //GET login page
    showLogin(req, res, next) {
        res.render('login', { cssFiles: ['/css/login.css'], noSlider: true, jsFiles: ['/js/validateInput.js', '/js/login.js', '/socket.io/socket.io.js'] });
    }

    //POST login account
    async login(req, res, next) {
        const { username, password, rememberMe } = req.body;
        console.log(req.body);
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
                req.session.user = { userId: user.user_id.toString(), name: user.name, img: user.profile_picture, rememberMe };
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
            const [user, created] = await User(db).findOrCreate({ where: validatedData});
            console.log(user);
            res.redirect('/login');
        } catch (error)
        {
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
}

module.exports = new SiteController();