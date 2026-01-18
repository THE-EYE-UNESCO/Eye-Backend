"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponderController = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class ResponderController {
    async getAssignedIncidents(req, res) {
        try {
            const responderId = req.user?.id;
            const incidents = [
                {
                    id: (0, uuid_1.v4)(),
                    report_id: (0, uuid_1.v4)(),
                    status: types_1.IncidentStatus.ASSIGNED,
                    priority: 'HIGH',
                    assigned_responder_id: responderId,
                    created_at: new Date()
                }
            ];
            res.json({ incidents });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch assigned incidents' });
        }
    }
    async getIncidentDetails(req, res) {
        try {
            const { id } = req.params;
            const incident = {
                id,
                report_id: (0, uuid_1.v4)(),
                status: types_1.IncidentStatus.ASSIGNED,
                priority: 'HIGH',
                assigned_responder_id: req.user?.id,
                created_at: new Date(),
                report: {
                    title: 'Fire Outbreak',
                    description: 'Fire reported in residential area',
                    category: 'Fire',
                    severity: 'HIGH',
                    latitude: -1.943,
                    longitude: 30.059
                }
            };
            res.json({ incident });
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch incident details' });
        }
    }
    async updateIncidentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                throw new errorHandler_1.AppError('Status is required', 400);
            }
            const validStatuses = Object.values(types_1.IncidentStatus);
            if (!validStatuses.includes(status)) {
                throw new errorHandler_1.AppError('Invalid status', 400);
            }
            const incident = {
                id,
                status,
                updated_at: new Date()
            };
            res.json({
                message: 'Incident status updated successfully',
                incident
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to update incident status' });
        }
    }
    async uploadEvidence(req, res) {
        try {
            const { id } = req.params;
            const { file_url, note } = req.body;
            if (!file_url) {
                throw new errorHandler_1.AppError('File URL is required', 400);
            }
            const evidence = {
                id: (0, uuid_1.v4)(),
                incident_id: id,
                uploaded_by: req.user?.id,
                file_url,
                note,
                created_at: new Date()
            };
            res.status(201).json({
                message: 'Evidence uploaded successfully',
                evidence
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to upload evidence' });
        }
    }
}
exports.ResponderController = ResponderController;
