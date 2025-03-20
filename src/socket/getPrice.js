const db = require('../config/db');
module.exports = function (io, socket) {
    socket.on('getPrice', async (s, type) => {
        var p;
        if (s) {
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
            where vehicle_type_id = ${type}`);

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
        }

        socket.emit('receivePrice', p.toLocaleString('vi-VN'));
    })

};