"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const databaseService_1 = require("./databaseService");
const reportService_1 = require("./reportService");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class AdminService {
    constructor() {
        this.db = databaseService_1.DatabaseService.getInstance();
        this.reportService = new reportService_1.ReportService();
    }
    async getDashboardMetrics() {
        return this.db.getDashboardMetrics();
    }
    async getPendingReports() {
        return this.reportService.getPendingReports();
    }
    async verifyReport(reportId, verificationData) {
        const { verified, priority } = verificationData;
        if (typeof verified !== 'boolean') {
            throw new errorHandler_1.AppError('Verification status is required', 400);
        }
        const report = await this.db.getReport(reportId);
        if (!report) {
            throw new errorHandler_1.AppError('Report not found', 404);
        }
        if (verified) {
            await this.reportService.updateReportStatus(reportId, 'VERIFIED');
            const incident = await this.db.createIncident({
                report_id: reportId,
                status: types_1.IncidentStatus.NEW,
                priority: priority || types_1.Priority.MEDIUM
            });
            await this.createAutoAlert(incident.id, report);
            return {
                incident,
                message: 'Report verified and incident created'
            };
        }
        else {
            await this.reportService.updateReportStatus(reportId, 'REJECTED');
            return {
                message: 'Report rejected'
            };
        }
    }
    async getIncidents(status) {
        if (status) {
            return this.db.getIncidentsByStatus(status);
        }
        return [];
    }
    async assignResponder(incidentId, assignmentData) {
        const { responder_id } = assignmentData;
        if (!responder_id) {
            throw new errorHandler_1.AppError('Responder ID is required', 400);
        }
        const incident = await this.db.getIncident(incidentId);
        if (!incident) {
            throw new errorHandler_1.AppError('Incident not found', 404);
        }
        if (incident.status !== types_1.IncidentStatus.NEW) {
            throw new errorHandler_1.AppError('Incident cannot be assigned in current status', 400);
        }
        await this.db.updateResponderStatus(responder_id, {
            availability: 'BUSY'
        });
        const updatedIncident = await this.db.updateIncident(incidentId, {
            assigned_responder_id: responder_id,
            status: types_1.IncidentStatus.ASSIGNED
        });
        if (!updatedIncident) {
            throw new errorHandler_1.AppError('Failed to update incident', 500);
        }
        return updatedIncident;
    }
    async createAutoAlert(incidentId, report) {
        if (report.severity === 'HIGH') {
            await this.db.createAlert({
                incident_id: incidentId,
                message: `High severity incident: ${report.title}`,
                priority: 'CRITICAL'
            });
        }
    }
}
exports.AdminService = AdminService;
