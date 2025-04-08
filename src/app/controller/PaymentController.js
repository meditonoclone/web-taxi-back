const express = require('express');
const router = express.Router();
const { createMomoCollectionLink } = require('../services/momo');
class PaymentController {
    castMethod(req, res) {
        // Xử lý đơn hàng trả tiền mặt
        res.send("✅ Thanh toán thành công");
    };

    async momoMethod(req, res) {
        const amount = 10000;
        const orderId = Date.now().toString();
        const redirectUrl = "https://localhost:3000/";

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

}

module.exports = new PaymentController();
