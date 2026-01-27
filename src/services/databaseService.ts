import { User, Report, Incident, Alert, ResponderStatus, Evidence } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseService {
  private static instance: DatabaseService;
  private users: Map<string, User> = new Map();
  private reports: Map<string, Report> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private responderStatuses: Map<string, ResponderStatus> = new Map();
  private evidence: Map<string, Evidence> = new Map();

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const user: User = {
      id: uuidv4(),
      ...userData,
      created_at: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async createReport(reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report> {
    const report: Report = {
      id: uuidv4(),
      ...reportData,
      created_at: new Date()
    };
    this.reports.set(report.id, report);
    return report;
  }

  async createIncident(incidentData: Omit<Incident, 'id' | 'created_at'>): Promise<Incident> {
    const incident: Incident = {
      id: uuidv4(),
      ...incidentData,
      created_at: new Date()
    };
    this.incidents.set(incident.id, incident);
    return incident;
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const alert: Alert = {
      id: uuidv4(),
      ...alertData,
      created_at: new Date()
    };
    this.alerts.set(alert.id, alert);
    return alert;
  }

  async updateResponderStatus(responderId: string, statusData: Omit<ResponderStatus, 'responder_id' | 'updated_at'>): Promise<ResponderStatus> {
    const responderStatus: ResponderStatus = {
      responder_id: responderId,
      ...statusData,
      updated_at: new Date()
    };
    this.responderStatuses.set(responderId, responderStatus);
    return responderStatus;
  }

  async createEvidence(evidenceData: Omit<Evidence, 'id' | 'created_at'>): Promise<Evidence> {
    const evidence: Evidence = {
      id: uuidv4(),
      ...evidenceData,
      created_at: new Date()
    };
    this.evidence.set(evidence.id, evidence);
    return evidence;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email) || null;
  }

  async getReport(id: string): Promise<Report | null> {
    return this.reports.get(id) || null;
  }

  async getIncident(id: string): Promise<Incident | null> {
    return this.incidents.get(id) || null;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(report => report.status === status);
  }

  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(incident => incident.status === status);
  }

  async getIncidentsByResponder(responderId: string): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(incident => incident.assigned_responder_id === responderId);
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    const report = this.reports.get(id);
    if (!report) return null;
    
    const updatedReport = { ...report, ...updates };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const incident = this.incidents.get(id);
    if (!incident) return null;
    
    const updatedIncident = { ...incident, ...updates };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async getDashboardMetrics(): Promise<any> {
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
