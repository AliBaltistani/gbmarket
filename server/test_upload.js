const fs = require('fs');
const path = require('path');

async function run() {
    try {
        console.log("Logging in as admin...");
        // 1. Login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'YourSecurePassword123'
            })
        });

        const cookie = loginRes.headers.get('set-cookie');
        console.log("Logged in successfully. Cookie present:", !!cookie);

        // 2. Upload image
        console.log("Creating dummy image...");
        const buffer = Buffer.from('dummy image content', 'utf8');
        fs.writeFileSync('dummy.jpg', buffer);

        console.log("Uploading dummy image...");
        const formData = new FormData();
        const blob = new Blob([fs.readFileSync('dummy.jpg')], { type: 'image/jpeg' });
        formData.append('image', blob, 'dummy.jpg');

        const uploadRes = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            headers: { 'Cookie': cookie },
            body: formData
        });

        const data = await uploadRes.json();
        console.log("Upload Response: ", data);

        // Cleanup
        fs.unlinkSync('dummy.jpg');
        console.log("Done!");
    } catch (err) {
        console.error("Error:", err.message);
    }
}

run();
