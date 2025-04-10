const express = require('express');
const { createMomoCollectionLink } = require('../services/momo');
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const {  User, Trip, Payment } = require('../model');
class PaymentController {
    async  cashMethod(req, res) {
        // Xử lý đơn hàng trả tiền mặt
        const tripId = req.session.tripId;
        console.log(tripId)
        if(!tripId)
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
        return res.json({message: 'Chờ xác nhận của tài xế!'});
    };

    async momoMethod(req, res) {
        const tripId = req.session.tripId;
        console.log(tripId)
        if(!tripId)
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
            momo_order_id: orderId,
            method: 'momo'

        })
        const redirectUrl = "https://5ce0-115-76-48-204.ngrok-free.app/account";

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
    async updatePaymentStatus(req, res) {
        const data = req.body;
        console.log('MoMo IPN received:', data);
        const accessKey = 'F8BBA842ECF85';
        const partnerCode = 'MOMO';
        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
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
                        momo_order_id: data.orderId
                    }
                    
                })
                await payment.update({status: 'paid'})
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
}

module.exports = new PaymentController();
