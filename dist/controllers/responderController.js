"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponderController = void 0;
const responderService_1 = require("../services/responderService");
const errorHandler_1 = require("../middleware/errorHandler");
class ResponderController {
    constructor() {
        this.responderService = new responderService_1.ResponderService();
    }
    async getAssignedIncidents(req, res) {
        try {
            const responderId = req.user?.id;
            if (!responderId) {
                throw new errorHandler_1.AppError('Responder ID not found', 400);
            }
            const incidents = await this.responderService.getAssignedIncidents(responderId);
            res.json({ incidents });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch assigned incidents' });
        }
    }
    async getIncidentDetails(req, res) {
        try {
            const { id } = req.params;
            const incidentId = Array.isArray(id) ? id[0] : id;
            const responderId = req.user?.id;
            if (!responderId) {
                throw new errorHandler_1.AppError('Responder ID not found', 400);
            }
            const incidentDetails = await this.responderService.getIncidentDetails(incidentId, responderId);
            res.json({ incident: incidentDetails });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch incident details' });
        }
    }
    async updateIncidentStatus(req, res) {
        try {
            const { id } = req.params;
            const incidentId = Array.isArray(id) ? id[0] : id;
            const statusUpdate = req.body;
            const responderId = req.user?.id;
            if (!responderId) {
                throw new errorHandler_1.AppError('Responder ID not found', 400);
            }
            const incident = await this.responderService.updateIncidentStatus(incidentId, statusUpdate, responderId);
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
            const incidentId = Array.isArray(id) ? id[0] : id;
            const evidenceData = req.body;
            const responderId = req.user?.id;
            if (!responderId) {
                throw new errorHandler_1.AppError('Responder ID not found', 400);
            }
            const evidence = await this.responderService.uploadEvidence(incidentId, evidenceData, responderId);
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
