"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const reportService_1 = require("../services/reportService");
const errorHandler_1 = require("../middleware/errorHandler");
class ReportController {
    constructor() {
        this.reportService = new reportService_1.ReportService();
    }
    async createReport(req, res) {
        try {
            const reportData = req.body;
            const citizenId = req.user?.id;
            const report = await this.reportService.createReport(reportData, citizenId);
            res.status(201).json({
                message: 'Report created successfully',
                report
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to create report' });
        }
    }
    async getReport(req, res) {
        try {
            const { id } = req.params;
            const citizenId = req.user?.id;
            const reportId = Array.isArray(id) ? id[0] : id;
            const report = await this.reportService.getReportById(reportId, citizenId);
            res.json({ report });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch report' });
        }
    }
    async getReportStatus(req, res) {
        try {
            const { id } = req.params;
            const citizenId = req.user?.id;
            const reportId = Array.isArray(id) ? id[0] : id;
            const status = await this.reportService.getReportStatus(reportId, citizenId);
            res.json({ status });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch report status' });
        }
    }
}
exports.ReportController = ReportController;
