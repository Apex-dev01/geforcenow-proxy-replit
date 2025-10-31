const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL || 'https://api.example.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Proxy endpoint for GET requests
app.get('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const url = `${TARGET_URL}/${path}`;
    const queryString = Object.keys(req.query).length ? `?${new URLSearchParams(req.query).toString()}` : '';
    
    console.log(`Proxying GET request to: ${url}${queryString}`);
    
    const response = await axios.get(`${url}${queryString}`, {
      headers: {
        ...req.headers,
        'X-Forwarded-For': req.ip,
        'X-Original-URL': req.originalUrl
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Proxy request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for POST requests
app.post('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const url = `${TARGET_URL}/${path}`;
    
    console.log(`Proxying POST request to: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        ...req.headers,
        'X-Forwarded-For': req.ip,
        'X-Original-URL': req.originalUrl
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Proxy request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'GeForce NOW Proxy Server',
    version: '1.0.0',
    description: 'A Node.js Express-based proxy server for GeForce NOW',
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Proxy Server Started`);
  console.log(`========================================`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`========================================\n`);
});

module.exports = app;
