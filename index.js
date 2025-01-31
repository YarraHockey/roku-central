const express = require('express');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;
const ROKU_PUBLIC_IP = process.env.ROKU_PUBLIC_IP;
const ROKU_PUBLIC_PORT = process.env.ROKU_PUBLIC_PORT || '9060';
const API_KEY = process.env.API_KEY || 'default-key';

console.log('Server starting with configuration:');
console.log('ROKU_PUBLIC_IP:', ROKU_PUBLIC_IP);
console.log('ROKU_PUBLIC_PORT:', ROKU_PUBLIC_PORT);
console.log('PORT:', PORT);

app.use(express.json());

const checkApiKey = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];
    if (providedKey !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

app.post('/roku-command', checkApiKey, async (req, res) => {
    const { action } = req.body;
    
    try {
        const rokuUrl = `http://${ROKU_PUBLIC_IP}:${ROKU_PUBLIC_PORT}/keypress/${action}`;
        console.log('Sending command to:', rokuUrl);
        
        const response = await fetch(rokuUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': '0',
                'Accept': '*/*'
            }
        });
        
        console.log('Roku response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Command sent successfully');
        res.json({ success: true });
        
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        roku_ip: ROKU_PUBLIC_IP,
        roku_port: ROKU_PUBLIC_PORT
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
