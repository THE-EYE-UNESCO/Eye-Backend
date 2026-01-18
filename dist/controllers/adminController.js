"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class AdminController {
    async getDashboard(req, res) {
        try {
            const dashboard = {
                totalReports: 150,
                activeIncidents: 12,
                resolvedIncidents: 138,
                availableResponders: 8,
                busyResponders: 4
            };
            res.json({ dashboard });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    }
    async getPendingReports(req, res) {
        try {
            const reports = [
                {
                    id: (0, uuid_1.v4)(),
                    title: 'Fire Outbreak',
                    description: 'Fire reported in residential area',
                    category: 'Fire',
                    severity: 'HIGH',
                    latitude: -1.943,
                    longitude: 30.059,
                    status: types_1.ReportStatus.PENDING,
                    created_at: new Date()
                }
            ];
            res.json({ reports });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch pending reports' });
        }
    }
    async verifyReport(req, res) {
        try {
            const { id } = req.params;
            const { verified, priority } = req.body;
            if (typeof verified !== 'boolean') {
                throw new errorHandler_1.AppError('Verification status is required', 400);
            }
            if (verified) {
                const incidentId = (0, uuid_1.v4)();
                const incident = {
                    id: incidentId,
                    report_id: id,
                    status: types_1.IncidentStatus.NEW,
                    priority: priority || types_1.Priority.MEDIUM,
                    created_at: new Date()
                };
                res.json({
                    message: 'Report verified and incident created',
                    incident
                });
            }
            else {
                res.json({
                    message: 'Report rejected'
                });
            }
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
            const incidents = [
                {
                    id: (0, uuid_1.v4)(),
                    report_id: (0, uuid_1.v4)(),
                    status: types_1.IncidentStatus.ASSIGNED,
                    priority: types_1.Priority.HIGH,
                    assigned_responder_id: (0, uuid_1.v4)(),
                    created_at: new Date()
                }
            ];
            res.json({ incidents });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch incidents' });
        }
    }
    async assignResponder(req, res) {
        try {
            const { id } = req.params;
            const { responder_id } = req.body;
            if (!responder_id) {
                throw new errorHandler_1.AppError('Responder ID is required', 400);
            }
            const incident = {
                id,
                assigned_responder_id: responder_id,
                status: types_1.IncidentStatus.ASSIGNED
            };
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
}
exports.AdminController = AdminController;
