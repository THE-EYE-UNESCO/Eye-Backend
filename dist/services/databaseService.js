"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const uuid_1 = require("uuid");
class DatabaseService {
    constructor() {
        this.users = new Map();
        this.reports = new Map();
        this.incidents = new Map();
        this.alerts = new Map();
        this.responderStatuses = new Map();
        this.evidence = new Map();
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async createUser(userData) {
        const user = {
            id: (0, uuid_1.v4)(),
            ...userData,
            created_at: new Date()
        };
        this.users.set(user.id, user);
        return user;
    }
    async createReport(reportData) {
        const report = {
            id: (0, uuid_1.v4)(),
            ...reportData,
            created_at: new Date()
        };
        this.reports.set(report.id, report);
        return report;
    }
    async createIncident(incidentData) {
        const incident = {
            id: (0, uuid_1.v4)(),
            ...incidentData,
            created_at: new Date()
        };
        this.incidents.set(incident.id, incident);
        return incident;
    }
    async createAlert(alertData) {
        const alert = {
            id: (0, uuid_1.v4)(),
            ...alertData,
            created_at: new Date()
        };
        this.alerts.set(alert.id, alert);
        return alert;
    }
    async updateResponderStatus(responderId, statusData) {
        const responderStatus = {
            responder_id: responderId,
            ...statusData,
            updated_at: new Date()
        };
        this.responderStatuses.set(responderId, responderStatus);
        return responderStatus;
    }
    async createEvidence(evidenceData) {
        const evidence = {
            id: (0, uuid_1.v4)(),
            ...evidenceData,
            created_at: new Date()
        };
        this.evidence.set(evidence.id, evidence);
        return evidence;
    }
    async getUserByEmail(email) {
        const users = Array.from(this.users.values());
        return users.find(user => user.email === email) || null;
    }
    async getReport(id) {
        return this.reports.get(id) || null;
    }
    async getIncident(id) {
        return this.incidents.get(id) || null;
    }
    async getAllReports() {
        return Array.from(this.reports.values());
    }
    async getAllIncidents() {
        return Array.from(this.incidents.values());
    }
    async getReportsByStatus(status) {
        return Array.from(this.reports.values()).filter(report => report.status === status);
    }
    async getIncidentsByStatus(status) {
        return Array.from(this.incidents.values()).filter(incident => incident.status === status);
    }
    async deleteReport(id) {
        this.reports.delete(id);
    }
    async deleteIncident(id) {
        this.incidents.delete(id);
    }
    async getIncidentsByResponder(responderId) {
        return Array.from(this.incidents.values()).filter(incident => incident.assigned_responder_id === responderId);
    }
    async updateReport(id, updates) {
        const report = this.reports.get(id);
        if (!report)
            return null;
        const updatedReport = { ...report, ...updates };
        this.reports.set(id, updatedReport);
        return updatedReport;
    }
    async updateIncident(id, updates) {
        const incident = this.incidents.get(id);
        if (!incident)
            return null;
        const updatedIncident = { ...incident, ...updates };
        this.incidents.set(id, updatedIncident);
        return updatedIncident;
    }
    async getDashboardMetrics() {
        const reports = Array.from(this.reports.values());
        const incidents = Array.from(this.incidents.values());
        const responders = Array.from(this.responderStatuses.values());
        return {
            totalReports: reports.length,
            activeIncidents: incidents.filter(i => i.status !== 'RESOLVED').length,
            resolvedIncidents: incidents.filter(i => i.status === 'RESOLVED').length,
            availableResponders: responders.filter(r => r.availability === 'AVAILABLE').length,
            busyResponders: responders.filter(r => r.availability === 'BUSY').length
        };
    }
}
exports.DatabaseService = DatabaseService;
