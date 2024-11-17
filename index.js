const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const app = express();
const port = 3000;

let client = new Client();
let qrCodeData = null;
let connectedNumber = null;
let status = null;

client.on('qr', (qr) => {
    qrCodeData = qr;
    console.log('QR RECEIVED');
});

client.on('ready', () => {
    status = 'ready';
    console.log('WhatsApp Web is ready!');
});

client.on('error', (err) => {
    console.error('Error:', err);
});

client.initialize();
client.on('ready', async () => {
    console.log('WhatsApp Web is ready!');
    qrCodeData = null; 
    
    const info = await client.getState();
    connectedNumber = info ? (await client.info.me.user) : null;
});

app.get('/get-qr', async (req, res) => {
    if (qrCodeData) {
        try {
            const qrImage = await qrcode.toDataURL(qrCodeData); 
            res.send({ success: true, qrImage });
        } catch (err) {
            res.status(500).send({ success: false, error: err.message });
        }
    } else {
        res.status(400).send({ success: false, message: 'QR Code not available or already scanned.' });
    }
});

app.get('/connected-info', (req, res) => {
    if (connectedNumber) {
        res.send({ success: true, connectedNumber });
    } else {
        res.status(400).send({ success: false, message: 'No WhatsApp account connected.' });
    }
});
app.post('/send-message', express.json(), (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).send({ error: 'Number and message are required' });
    }
    client.sendMessage(`${number}@c.us`, message)
        .then((response) => res.send({ success: true, response }))
        .catch((err) => res.status(500).send({ success: false, error: err.message }));
});
app.post('/disconnect', (req, res) => {
    if (client) {
        client.logout()
            .then(() => {
                client.destroy()  
                    .then(() => {
                        console.log('Client disconnected');
                        connectedNumber = null
                        
                        client = new Client();
                        client.on('qr', (qr) => {
                            console.log('QR RECEIVED');
                            qrCodeData = qr;  
                        });
                        client.initialize();  
                        client.on('ready', async () => {
                            console.log('WhatsApp Web is ready!');
                            qrCodeData = null; 
                            const info = await client.getState();
                            connectedNumber = info ? (await client.info.me.user) : null;
                        });
                        res.send({ success: true, message: 'Client disconnected and restarted successfully.' });
                    })
                    .catch((err) => {
                        console.error('Error during logout:', err.message);
                        res.status(500).send({ success: false, message: 'Failed to disconnect and restart the client.' });
                    });
            })
            .catch((err) => {
                console.error('Logout Error:', err.message);
                res.status(500).send({ success: false, message: 'Failed to disconnect the client.' });
            });
    } else {
        res.status(400).send({ success: false, message: 'No active client to disconnect.' });
    }
});
app.listen(port, () => console.log(`Server running on http: http://localhost:${port}`));