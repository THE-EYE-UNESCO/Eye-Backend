"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponderService = void 0;
const databaseService_1 = require("./databaseService");
const types_1 = require("../types");
const errorHandler_1 = require("../middleware/errorHandler");
class ResponderService {
    constructor() {
        this.db = databaseService_1.DatabaseService.getInstance();
    }
    async getAssignedIncidents(responderId) {
        return this.db.getIncidentsByResponder(responderId);
    }
    async getAllReports() {
        return this.db.getAllReports();
    }
    async getIncidentDetails(incidentId, responderId) {
        const incident = await this.db.getIncident(incidentId);
        if (!incident) {
            throw new errorHandler_1.AppError('Incident not found', 404);
        }
        if (incident.assigned_responder_id !== responderId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        const report = await this.db.getReport(incident.report_id);
        return {
            incident,
            report
        };
    }
    async updateIncidentStatus(incidentId, statusUpdate, responderId) {
        const { status } = statusUpdate;
        if (!status) {
            throw new errorHandler_1.AppError('Status is required', 400);
        }
        const validStatuses = Object.values(types_1.IncidentStatus);
        if (!validStatuses.includes(status)) {
            throw new errorHandler_1.AppError('Invalid status', 400);
        }
        const incident = await this.db.getIncident(incidentId);
        if (!incident) {
            throw new errorHandler_1.AppError('Incident not found', 404);
        }
        if (incident.assigned_responder_id !== responderId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        const validTransitions = {
            [types_1.IncidentStatus.ASSIGNED]: [types_1.IncidentStatus.ON_THE_WAY],
            [types_1.IncidentStatus.ON_THE_WAY]: [types_1.IncidentStatus.ON_SITE],
            [types_1.IncidentStatus.ON_SITE]: [types_1.IncidentStatus.RESOLVED],
            [types_1.IncidentStatus.RESOLVED]: [],
            [types_1.IncidentStatus.NEW]: []
        };
        if (!validTransitions[incident.status].includes(status)) {
            throw new errorHandler_1.AppError(`Invalid status transition from ${incident.status} to ${status}`, 400);
        }
        const updatedIncident = await this.db.updateIncident(incidentId, { status });
        if (!updatedIncident) {
            throw new errorHandler_1.AppError('Failed to update incident', 500);
        }
        if (status === types_1.IncidentStatus.RESOLVED) {
            await this.db.updateResponderStatus(responderId, {
                availability: 'AVAILABLE'
            });
        }
        return updatedIncident;
    }
    async uploadEvidence(incidentId, evidenceData, responderId) {
        const { file_url, note } = evidenceData;
        if (!file_url) {
            throw new errorHandler_1.AppError('File URL is required', 400);
        }
        const incident = await this.db.getIncident(incidentId);
        if (!incident) {
            throw new errorHandler_1.AppError('Incident not found', 404);
        }
        if (incident.assigned_responder_id !== responderId) {
            throw new errorHandler_1.AppError('Access denied', 403);
        }
        const evidence = await this.db.createEvidence({
            incident_id: incidentId,
            uploaded_by: responderId,
            file_url,
            note
        });
        return evidence;
    }
}
exports.ResponderService = ResponderService;
