const express = require('express');
const { createMomoCollectionLink } = require('../services/momo');
const https = require('https');
const crypto = require('crypto');
const querystring = require('qs');
const { User, Trip, Payment } = require('../model');
const moment = require('moment')
class PaymentController {
    async cashMethod(req, res) {
        // Xử lý đơn hàng trả tiền mặt
        const tripId = req.session.tripId;
        console.log(tripId)
        if (!tripId)
            return res.status(400).send("Lỗi khi tạo thanh toán online.")
        const trip = await Trip.findByPk(tripId)
        const payment = await Payment.findOne({
            where: {
                trip_id: tripId
            }
        })
        payment.update({
            method: 'cash',
            amount: trip.cost
        })
        return res.json({ message: 'Chờ xác nhận của tài xế!' });
    };

    async momoMethod(req, res) {
        const tripId = req.session.tripId;
        console.log(tripId)
        if (!tripId)
            return res.status(400).send("Lỗi khi tạo thanh toán online.")
        const trip = await Trip.findByPk(tripId)
        const payment = await Payment.findOne({
            where: {
                trip_id: tripId
            }
        })

        const amount = trip.cost.toString();
        const orderId = Date.now().toString();
        await payment.update({
            order_id: orderId,
            method: 'momo'

        })
        const redirectUrl = process.env.MOMO_REDERECT_URL;

        try {
            const momoRes = await createMomoCollectionLink(amount, orderId, redirectUrl);
            console.log(momoRes)
            if (momoRes && momoRes.shortLink) {
                return res.redirect(momoRes.shortLink);
            } else {
                res.send("Không thể tạo link thanh toán.");
            }
        } catch (err) {
            console.error("Lỗi tạo collection link:", err);
            res.status(500).send("Lỗi khi tạo thanh toán online.");
        }
    };
    async momoReturn(req, res) {
        const data = req.body;
        console.log('MoMo IPN received:', data);
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        // Bước 1: Tạo rawSignature giống như bên MoMo yêu cầu
        const rawSignature =
            `accessKey=${accessKey}` +
            `&amount=${data.amount}` +
            `&extraData=${data.extraData}` +
            `&message=${data.message}` +
            `&orderId=${data.orderId}` +
            `&orderInfo=${data.orderInfo}` +
            `&orderType=${data.orderType}` +
            `&partnerCode=${data.partnerCode}` +
            `&payType=${data.payType}` +
            `&requestId=${data.requestId}` +
            `&responseTime=${data.responseTime}` +
            `&resultCode=${data.resultCode}` +
            `&transId=${data.transId}`;

        // Bước 2: Tạo chữ ký từ secretKey
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        console.log(signature, data.signature)
        // Bước 3: So sánh signature để đảm bảo tính toàn vẹn
        if (signature === data.signature) {
            console.log('✅ Chữ ký hợp lệ.');

            // Kiểm tra kết quả giao dịch
            if (data.resultCode === 0) {
                const payment = await Payment.findOne({
                    where: {
                        order_id: data.orderId
                    }

                })
                await payment.update({ status: 'paid' })
                const io = req.app.get('io');
                io.to(payment.trip_id.toString()).emit('paid', true);
                console.log('💰 Giao dịch thành công cho orderId:', data.orderId);
                // TODO: Update order in DB here
            } else {
                console.log('❌ Giao dịch thất bại:', data.message);
            }

            // Trả kết quả về cho MoMo (bắt buộc)
            res.status(200).json({
                message: "Received IPN",
                resultCode: 0
            });
        } else {
            console.error('❗ Chữ ký không hợp lệ!');
            res.status(400).json({
                message: "Invalid signature",
                resultCode: 1
            });
        }
    }
    async transactionStatus(req, res) {
        const { orderId } = req.body;

        const accessKey = 'F8BBA842ECF85';
        const partnerCode = 'MOMO';
        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const requestId = orderId;

        const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = JSON.stringify({
            partnerCode,
            requestId,
            orderId,
            signature,
            lang: 'vi'
        });

        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/query',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    res.status(200).json(result);
                } catch (err) {
                    res.status(500).json({ message: 'Parse error', error: err.message });
                }
            });
        });

        apiReq.on('error', (e) => {
            res.status(500).json({ message: 'Request error', error: e.message });
        });

        apiReq.write(requestBody);
        apiReq.end();
    }
    async vnpayMethod(req, res) {
        const tripId = req.session.tripId;
        console.log(tripId)
        if (!tripId)
            return res.status(400).send("Lỗi khi tạo thanh toán online.")
        const trip = await Trip.findByPk(tripId)
        const payment = await Payment.findOne({
            where: {
                trip_id: tripId
            }
        })
        const date = new Date();
        const orderId = moment(date).format('HHmmss');
        const amount = trip.cost * 100;
        await payment.update({
            order_id: orderId,
            method: 'vnpay'

        })
        const ipAddr = req.ip;

        const tmnCode = process.env.VNPAY_TMN_CODE;
        const secretKey = process.env.VNPAY_SECRET_KEY;
        const vnpUrl = process.env.VNPAY_URL;
        const returnUrl = process.env.VNPAY_RETURN_URL;


        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const bankCode = req.body.bankCode || '';

        const orderInfo = `Thanh toan chuyen ${orderId}`;
        const orderType = 'other';
        const locale = 'vn';
        const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: orderType,
            vnp_Amount: amount,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_expireDate: expireDate
        };

        if (bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }
        console.log('trc: ', vnp_Params)
        // Sort parameters
        vnp_Params = PaymentController.sortObject(vnp_Params);
        console.log('sau: ', vnp_Params)

        // Create hash
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;
      
        res.json({ paymentUrl });
    }

    async vnpayReturn(req, res) {
        const vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        const secretKey = process.env.VNPAY_SECRET_KEY;
        const signData = querystring.stringify(PaymentController.sortObject(vnp_Params), { encode: false });

        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            const payment = await Payment.findOne({
                where: {
                    order_id: vnp_Params['vnp_TxnRef']
                }

            })
            await payment.update({ status: 'paid' })
            const io = req.app.get('io');
            io.to(payment.trip_id.toString()).emit('paid', true);
            res.status(200).json({RspCode: '00', Message: 'success'})
        } else {
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }
    }
    static sortObject(obj) {
        var sorted = {};
        var str = [];
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }
}

module.exports = new PaymentController();
