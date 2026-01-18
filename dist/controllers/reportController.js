"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class ReportController {
    async createReport(req, res) {
        try {
            const { title, description, category, severity, latitude, longitude } = req.body;
            if (!title || !description || !category || !severity || latitude === undefined || longitude === undefined) {
                throw new errorHandler_1.AppError('All fields are required', 400);
            }
            const reportId = (0, uuid_1.v4)();
            const citizenId = req.user?.id;
            const report = {
                id: reportId,
                citizen_id: citizenId,
                title,
                description,
                category,
                severity: severity,
                latitude,
                longitude,
                status: types_1.ReportStatus.PENDING,
                created_at: new Date()
            };
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
            const report = {
                id,
                citizen_id: req.user?.id,
                title: 'Sample Fire Report',
                description: 'Fire reported in residential area',
                category: 'Fire',
                severity: types_1.Severity.HIGH,
                latitude: -1.943,
                longitude: 30.059,
                status: types_1.ReportStatus.PENDING,
                created_at: new Date()
            };
            res.json({ report });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch report' });
        }
    }
    async getReportStatus(req, res) {
        try {
            const { id } = req.params;
            const status = {
                reportId: id,
                status: types_1.ReportStatus.PENDING,
                message: 'Your report is pending verification'
            };
            res.json({ status });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch report status' });
        }
    }
}
exports.ReportController = ReportController;
