const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecret_campusos_key_change_in_prod';
const token = jwt.sign({ id: 1, role: 'student' }, JWT_SECRET, { expiresIn: '1h' });

async function testBackend() {
    try {
        const response = await fetch("http://localhost:5000/api/ai/chat", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "hi",
                history: []
            })
        });

        console.log("Backend Status:", response.status);
        const data = await response.json();
        console.log("Backend Response:", data);
    } catch(err) {
        console.error("Backend Error:", err.message);
    }
}
testBackend();
