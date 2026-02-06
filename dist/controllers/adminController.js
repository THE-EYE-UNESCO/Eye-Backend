"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
const errorHandler_1 = require("../middleware/errorHandler");
class AdminController {
    constructor() {
        this.adminService = new adminService_1.AdminService();
    }
    async getDashboard(req, res) {
        try {
            const dashboard = await this.adminService.getDashboardMetrics();
            res.json({ dashboard });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    }
    async getPendingReports(req, res) {
        try {
            const reports = await this.adminService.getPendingReports();
            res.json({ reports });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch pending reports' });
        }
    }
    async verifyReport(req, res) {
        try {
            const { id } = req.params;
            const reportId = Array.isArray(id) ? id[0] : id;
            const verificationData = req.body;
            const result = await this.adminService.verifyReport(reportId, verificationData);
            res.json(result);
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to verify report' });
        }
    }
    async getIncidents(req, res) {
        try {
            const incidents = await this.adminService.getIncidents();
            res.json({ incidents });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch incidents' });
        }
    }
    async assignResponder(req, res) {
        try {
            const { id } = req.params;
            const incidentId = Array.isArray(id) ? id[0] : id;
            const assignmentData = req.body;
            const incident = await this.adminService.assignResponder(incidentId, assignmentData);
            res.json({
                message: 'Responder assigned successfully',
                incident
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to assign responder' });
        }
    }
    async getIncidentById(req, res) {
        try {
            const { id } = req.params;
            const incidentId = Array.isArray(id) ? id[0] : id;
            const incident = await this.adminService.getIncidentById(incidentId);
            res.json({ incident });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch incident' });
        }
    }
    async updateIncident(req, res) {
        try {
            const { id } = req.params;
            const incidentId = Array.isArray(id) ? id[0] : id;
            const updateData = req.body;
            const incident = await this.adminService.updateIncident(incidentId, updateData);
            res.json({ message: 'Incident updated successfully', incident });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to update incident' });
        }
    }
    async deleteIncident(req, res) {
        try {
            const { id } = req.params;
            const incidentId = Array.isArray(id) ? id[0] : id;
            await this.adminService.deleteIncident(incidentId);
            res.json({ message: 'Incident deleted successfully' });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to delete incident' });
        }
    }
}
exports.AdminController = AdminController;
