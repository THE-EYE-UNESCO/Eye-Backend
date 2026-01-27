import { DatabaseService } from './databaseService';
import { UpdateIncidentStatusRequest, CreateEvidenceRequest, Incident, IncidentStatus, Evidence } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ResponderService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async getAssignedIncidents(responderId: string): Promise<Incident[]> {
    return this.db.getIncidentsByResponder(responderId);
  }

  async getIncidentDetails(incidentId: string, responderId: string): Promise<{ incident: Incident; report: any } | null> {
    const incident = await this.db.getIncident(incidentId);
    
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    if (incident.assigned_responder_id !== responderId) {
      throw new AppError('Access denied', 403);
    }

    const report = await this.db.getReport(incident.report_id);
    
    return {
      incident,
      report
    };
  }

  async updateIncidentStatus(incidentId: string, statusUpdate: UpdateIncidentStatusRequest, responderId: string): Promise<Incident> {
    const { status } = statusUpdate;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const validStatuses = Object.values(IncidentStatus);
    if (!validStatuses.includes(status as IncidentStatus)) {
      throw new AppError('Invalid status', 400);
    }

    const incident = await this.db.getIncident(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    if (incident.assigned_responder_id !== responderId) {
      throw new AppError('Access denied', 403);
    }

    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      [IncidentStatus.ASSIGNED]: [IncidentStatus.ON_THE_WAY],
      [IncidentStatus.ON_THE_WAY]: [IncidentStatus.ON_SITE],
      [IncidentStatus.ON_SITE]: [IncidentStatus.RESOLVED],
      [IncidentStatus.RESOLVED]: [],
      [IncidentStatus.NEW]: []
    };

    if (!validTransitions[incident.status].includes(status as IncidentStatus)) {
      throw new AppError(`Invalid status transition from ${incident.status} to ${status}`, 400);
    }

    const updatedIncident = await this.db.updateIncident(incidentId, { status });
    if (!updatedIncident) {
      throw new AppError('Failed to update incident', 500);
    }

    if (status === IncidentStatus.RESOLVED) {
      await this.db.updateResponderStatus(responderId, {
        availability: 'AVAILABLE' as any
      });
    }

    return updatedIncident;
  }

  async uploadEvidence(incidentId: string, evidenceData: CreateEvidenceRequest, responderId: string): Promise<Evidence> {
    const { file_url, note } = evidenceData;

    if (!file_url) {
      throw new AppError('File URL is required', 400);
    }

    const incident = await this.db.getIncident(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    if (incident.assigned_responder_id !== responderId) {
      throw new AppError('Access denied', 403);
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
