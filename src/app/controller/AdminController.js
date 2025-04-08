const { Rating, User, Trip } = require('../model');
const { Op } = require('sequelize');
const moment = require('moment'); // Dùng thư viện moment.js để xử lý thời gian

class AdminController {
    async index(req, res) {
        const trips = await Trip.count();
        res.locals.numTrips = trips;

        const users = await User.count({ where: { account_type: 'client' } });
        res.locals.numClients = users;

        const revenue = await Trip.sum('cost');
        res.locals.revenue = revenue;


        const overView = {}
        const startOfMonth = moment().startOf('month').toDate(); // Ngày đầu tháng
        const endOfMonth = moment().endOf('month').toDate(); // Ngày cuối tháng
        const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toDate();
        const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toDate();

        const ratingTotal = await Rating.sum('rating',{
            where: {
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });
        const ratingNum = await Rating.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });
        overView.rating = ratingTotal / ratingNum;

        overView.revenue = await Trip.sum('cost', {
            where: {
                order_time: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        const revenueLastMonth = await Trip.sum('cost', {
            where: {
                order_time: {
                    [Op.between]: [startOfLastMonth, endOfLastMonth]
                }
            }
        });
        overView.revenueDiff = (overView.revenue - revenueLastMonth)/revenueLastMonth * 100;
        overView.booked = await Rating.count({
            where: {
                order_time: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        overView.completed = await Rating.count({
            where: {
                order_time: {
                    [Op.between]: [startOfMonth, endOfMonth]
                },
                status: 'completed'

            }
        });
        
        overView.sigups = User.count({where: {
            create_at: {
                [Op.between]: [startOfMonth, endOfMonth]
            }
        }})
        signupsLastMonth = await User.count({
            where: {
                create_at: {
                    [Op.between]: [startOfLastMonth, endOfLastMonth]
                }
            }
        });

        overView.growth = (overView.signups-signupsLastMonth)/signupsLastMonth*100;

        res.locals.overView = overView;

        res.render('admin/home', { layout: 'admin', jsFiles: ['/js/admin/dashboard.js'] });
    }
    showTrips(req, res) {
        res.render('admin/trips', { layout: 'admin', jsFiles: ['/js/admin/trips.js'] });
    }
    showAccount(req, res) {
        res.render('admin/account', { layout: 'admin', jsFiles: ['/js/admin/account.js'] })
    }
}

module.exports = new AdminController();