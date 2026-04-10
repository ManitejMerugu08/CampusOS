const http = require('http');

const testWebhook = (messageBody) => {
    return new Promise((resolve, reject) => {
        const postData = new URLSearchParams({
            Body: messageBody,
            From: 'whatsapp:+15551234567'
        }).toString();

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/whatsapp/webhook',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
};

(async () => {
    try {
        console.log("Testing WhatsApp 'menu' keyword...");
        const menuTest = await testWebhook("menu");
        console.log("Response XML:");
        console.log(menuTest);
        console.log("\n------------------\n");

        console.log("Testing WhatsApp 'create ticket'...");
        const ticketTest = await testWebhook("create ticket: Internet is down in the library");
        console.log("Response XML:");
        console.log(ticketTest);

    } catch (e) {
        console.error("Test failed:", e);
    }
})();
