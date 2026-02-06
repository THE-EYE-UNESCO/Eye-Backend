"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const databaseService_1 = require("./databaseService");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class ReportService {
    constructor() {
        this.db = databaseService_1.DatabaseService.getInstance();
    }
    async createReport(reportData, citizenId) {
        const { title, description, category, severity, latitude, longitude } = reportData;
        if (!title || !description || !category || !severity || latitude === undefined || longitude === undefined) {
            throw new errorHandler_1.AppError('All fields are required', 400);
        }
        if (!Object.values(types_1.Severity).includes(severity)) {
            throw new errorHandler_1.AppError('Invalid severity level', 400);
        }
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new errorHandler_1.AppError('Invalid coordinates', 400);
        }
        const report = await this.db.createReport({
            citizen_id: citizenId,
            title,
            description,
            category,
            severity,
            latitude,
            longitude,
            status: types_1.ReportStatus.PENDING
        });
        return report;
    }
    async getReportById(reportId, citizenId) {
        const report = await this.db.getReport(reportId);
        if (!report) {
            throw new errorHandler_1.AppError('Report not found', 404);
        }
        if (report.citizen_id && report.citizen_id !== citizenId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        return report;
    }
    async getReportStatus(reportId, citizenId) {
        const report = await this.getReportById(reportId, citizenId);
        if (!report) {
            throw new errorHandler_1.AppError('Report not found', 404);
        }
        const statusMessages = {
            [types_1.ReportStatus.PENDING]: 'Your report is pending verification',
            [types_1.ReportStatus.VERIFIED]: 'Your report has been verified and is being processed',
            [types_1.ReportStatus.REJECTED]: 'Your report was rejected',
            [types_1.ReportStatus.RESOLVED]: 'Your report has been resolved'
        };
        return {
            reportId,
            status: report.status,
            message: statusMessages[report.status]
        };
    }
    async getPendingReports() {
        return this.db.getReportsByStatus(types_1.ReportStatus.PENDING);
    }
    async getAllReports() {
        return this.db.getAllReports();
    }
    async updateReport(reportId, updateData) {
        const report = await this.db.getReport(reportId);
        if (!report) {
            throw new errorHandler_1.AppError('Report not found', 404);
        }
        if (updateData.severity && !Object.values(types_1.Severity).includes(updateData.severity)) {
            throw new errorHandler_1.AppError('Invalid severity level', 400);
        }
        if (updateData.latitude !== undefined && (updateData.latitude < -90 || updateData.latitude > 90)) {
            throw new errorHandler_1.AppError('Invalid latitude', 400);
        }
        if (updateData.longitude !== undefined && (updateData.longitude < -180 || updateData.longitude > 180)) {
            throw new errorHandler_1.AppError('Invalid longitude', 400);
        }
        return this.db.updateReport(reportId, updateData);
    }
    async deleteReport(reportId) {
        const report = await this.db.getReport(reportId);
        if (!report) {
            throw new errorHandler_1.AppError('Report not found', 404);
        }
        await this.db.deleteReport(reportId);
    }
    async updateReportStatus(reportId, status) {
        if (!Object.values(types_1.ReportStatus).includes(status)) {
            throw new errorHandler_1.AppError('Invalid status', 400);
        }
        return this.db.updateReport(reportId, { status });
    }
}
exports.ReportService = ReportService;
