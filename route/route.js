const express = require('express');
const Controller = require('../controller/controller');

const router = express.Router();
const controller = new Controller();

// Health check endpoint
router.get('/health', controller.healthCheck.bind(controller));

// Get report data (JSON)
router.get('/report/data', controller.getReportData.bind(controller));

// Generate PDF report
router.get('/report/pdf', controller.generatePDFReport.bind(controller));

// Generate Excel report
router.get('/report/excel', controller.generateExcelReport.bind(controller));

// Get report data by periode
router.get('/report/periode/:periode', controller.getReportDataByPeriode.bind(controller));

// Get report data by user
router.get('/report/user/:user', controller.getReportDataByUser.bind(controller));

// Get crops by type
router.get('/crops/type/:cropType', controller.getCropsByType.bind(controller));

// Get crops statistics
router.get('/crops/stats', controller.getCropsStats.bind(controller));

// Root endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Express Report API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            reportData: 'GET /report/data',
            pdfReport: 'GET /report/pdf',
            excelReport: 'GET /report/excel',
            reportByPeriode: 'GET /report/periode/:periode',
            reportByUser: 'GET /report/user/:user',
            cropsByType: 'GET /crops/type/:cropType',
            cropsStats: 'GET /crops/stats'
        },
        queryParams: {
            periode: 'Filter by periode (e.g., 08-2025)',
            user: 'Filter by user'
        }
    });
});

// 404 handler
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

module.exports = router;
