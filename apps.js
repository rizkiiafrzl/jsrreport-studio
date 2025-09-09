const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

 // Import logger
const logger = require('./utils/logger');

// Note: JsReport Studio runs separately via studio-server.js
// This app only handles the Express API endpoints

// Import routes
const routes = require('./route/route');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (if needed)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    logger.request(req);
    next();
});

// Routes
app.use('/api', routes);

// Global error handler
app.use((error, req, res, next) => {
    logger.error('Global Error Handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api`);
    logger.info(`Health Check: http://localhost:${PORT}/api/health`);
    logger.info(`Report Data: http://localhost:${PORT}/api/report/data`);
    logger.info(`PDF Report: http://localhost:${PORT}/api/report/pdf`);
    logger.info(`Excel Report: http://localhost:${PORT}/api/report/excel`);
    logger.info(`JsReport Studio: http://localhost:5488 (run 'npm run studio:dev' to start)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.warn('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.warn('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
