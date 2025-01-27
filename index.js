const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const ROKU_IP = process.env.ROKU_IP || '192.168.1.37';
const API_KEY = process.env.API_KEY || 'default-key';

// Log environment variables (excluding sensitive data)
console.log('Server starting with configuration:');
console.log('ROKU_IP:', ROKU_IP);
console.log('PORT:', PORT);

// Middleware
app.use(express.json());

// Verify API key
const checkApiKey = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];
    console.log('Received API key:', providedKey);
    if (providedKey !== API_KEY) {
        console.log('API key mismatch');
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

// Main control endpoint
app.post('/roku-command', checkApiKey, async (req, res) => {
    const { action } = req.body;
    
    try {
        const rokuUrl = `http://${ROKU_IP}:8060/keypress/${action}`;
        console.log('Attempting to send command to URL:', rokuUrl);
        
        const response = await fetch(rokuUrl, {
            method: 'POST'
        });
        
        console.log('Roku response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Command sent successfully');
        res.json({ success: true, message: 'Command sent to Roku' });
        
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            success: false, 
            error: error.message,
            errorCode: error.code
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        roku_ip: ROKU_IP,
        port: PORT
    });
});

// Start server
app.listen(PORT, () =>
