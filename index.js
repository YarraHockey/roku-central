const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const ROKU_IP = process.env.ROKU_IP || '192.168.1.37'; // We'll update this later
const API_KEY = process.env.API_KEY || 'default-key'; // We'll set this later

// Middleware
app.use(express.json());

// Verify API key
const checkApiKey = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];
    if (providedKey !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

// Main control endpoint
app.post('/roku-command', checkApiKey, async (req, res) => {
    const { action } = req.body;
    
    try {
        console.log(`Sending command: ${action} to Roku`);
        
        const response = await fetch(`http://${ROKU_IP}:8060/keypress/${action}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Command sent successfully');
        res.json({ success: true, message: 'Command sent to Roku' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
