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
        // Try different commands based on the action
        let command = action;
        if (action === 'PowerOn') {
            command = 'Power';
        }
        
        const rokuUrl = `http://${ROKU_PUBLIC_IP}:${ROKU_PUBLIC_PORT}/keypress/${command}`;
        console.log('Sending command to:', rokuUrl);
        
        const response = await fetch(rokuUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Roku/1.0',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': '0'
            },
            timeout: 5000 // 5 second timeout
        });
        
        console.log('Roku response status:', response.status);
        
        // Accept both 200 and 403 as "success" since some Roku commands return 403 but still work
        if (response.status !== 200 && response.status !== 403) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Command sent successfully');
        res.json({ success: true });
        
    } catch (error) {
        console.log('Error details:', {
            message: error.message,
            code: error.code,
            type: error.type
        });
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
