const User = require('../model/User');
const session = require('express-session');
const db = require('../../config/db');
const setLocals = require('../../middleware');
const cookieSignature = require('cookie-signature');

class SiteController {
    index(req, res) {
        console.log(res.locals.user);
        res.render('home', { home: true });
    }

    //GET login page
    showLogin(req, res) {
        res.render('login', { cssFiles: ['login.css'], noSlider: true });
    }

    //POST login account
    async login(req, res, next) {
        const { username, password } = req.body;
        try {
            const user = await User(db).findOne({ where: { phone: username, password: password } });
            if (user) {
                req.session.user = { userId: user.user_id, name: user.name, img: user.profile_picture };
                // setTimeout(()=>delete session.user, session.expires);
                const signedSessionId = cookieSignature.sign(req.sessionID, 'secret');
                

                res.cookie(user.user_id, signedSessionId, {
                    httpOnly: true, // Không cho phép truy cập cookie bằng JavaScript
                    secure: true, // Chỉ gửi cookie qua HTTPS
                    maxAge: 180 * 60 * 1000 // Thời gian hết hạn của cookie là 30 phút (tính bằng mili giây)
                });
                next();
                res.redirect('/');
            }
        } catch (e) {
            console.error('Error fetching user:', e);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }


    logout(req,res){
        req.session.destroy((err) => {
            if(err) console.log(err);
            res.clearCookie();
            res.redirect('/login');
        });
    }

    signup(req, res) {
        res.render('signup', { cssFiles: ['signup.css', 'login.css'], noSlider: true });
    }

    resetpass(req, res) {
        res.render('resetpass', { cssFiles: ['resetpass.css', 'login.css'], noSlider: true });
    }

    contact(req, res) {
        res.render('contact', { noSlider: true });
    }
}

module.exports = new SiteController();