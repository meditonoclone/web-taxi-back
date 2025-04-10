const https = require('https');
const crypto = require('crypto');

function createMomoCollectionLink(amount, orderId, redirectUrl) {
  return new Promise((resolve, reject) => {
    const partnerCode = 'MOMO';
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const requestId = orderId;
    const orderInfo = `Thanh toán chuyến đi: #${orderId}`;
    const extraData = '';
    const requestType = "payWithMethod";
    const ipnUrl = 'https://5ce0-115-76-48-204.ngrok-free.app/payment/callback';
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;

    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      extraData,
      signature,
      requestType,
      ipnUrl
    });
    console.log(requestBody);
    const options = {
      hostname: 'test-payment.momo.vn',
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(requestBody);
    req.end();
  });
}

module.exports = {createMomoCollectionLink}
