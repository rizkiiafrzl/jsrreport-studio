const Service = require('../service/service');

class Controller {
    constructor() {
        this.service = new Service();
    }

    async getReportData(req, res) {
        try {
            const params = {
                periode: req.query.periode,
                user: req.query.user,
                ...req.query
            };

            const result = await this.service.getReportData(params);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async generatePDFReport(req, res) {
        try {
            const params = {
                periode: req.query.periode,
                user: req.query.user,
                ...req.query
            };

            const result = await this.service.generatePDFReport(params);

            if (result.success) {
                res.setHeader('Content-Type', result.contentType || 'text/html');
                if (result.contentType === 'application/pdf') {
                    res.setHeader('Content-Disposition', 'attachment; filename="crops-report.pdf"');
                } else {
                    res.setHeader('Content-Disposition', 'attachment; filename="crops-report.html"');
                }
                return res.send(result.data);
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async generateExcelReport(req, res) {
        try {
            const params = {
                periode: req.query.periode,
                user: req.query.user,
                ...req.query
            };

            const result = await this.service.generateExcelReport(params);

            if (result.success) {
                res.setHeader('Content-Type', result.contentType || 'text/csv');
                if (result.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    res.setHeader('Content-Disposition', 'attachment; filename="crops-report.xlsx"');
                } else {
                    res.setHeader('Content-Disposition', 'attachment; filename="crops-report.csv"');
                }
                return res.send(result.data);
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async getReportDataByPeriode(req, res) {
        try {
            const { periode } = req.params;

            if (!periode) {
                return res.status(400).json({
                    success: false,
                    message: 'Periode parameter is required',
                    data: null
                });
            }

            const result = await this.service.getReportDataByPeriode(periode);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async getReportDataByUser(req, res) {
        try {
            const { user } = req.params;

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User parameter is required',
                    data: null
                });
            }

            const result = await this.service.getReportDataByUser(user);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async healthCheck(req, res) {
        try {
            return res.status(200).json({
                success: true,
                message: 'Service is healthy',
                timestamp: new Date().toISOString(),
                service: 'Express Report API'
            });
        } catch (error) {
            console.error('Health Check Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Service is unhealthy',
                timestamp: new Date().toISOString()
            });
        }
    }

    async getCropsByType(req, res) {
        try {
            const { cropType } = req.params;

            if (!cropType) {
                return res.status(400).json({
                    success: false,
                    message: 'Crop type parameter is required',
                    data: null
                });
            }

            const result = await this.service.getCropsByType(cropType);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }

    async getCropsStats(req, res) {
        try {
            const result = await this.service.getCropsStats();

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: null
                });
            }
        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }
}

module.exports = Controller;
