import { DatabaseService } from './databaseService';
import { ReportService } from './reportService';
import { VerifyReportRequest, AssignResponderRequest, Incident, IncidentStatus, Priority, Report } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AdminService {
  private db: DatabaseService;
  private reportService: ReportService;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.reportService = new ReportService();
  }

  async getDashboardMetrics(): Promise<any> {
    return this.db.getDashboardMetrics();
  }

  async getPendingReports(): Promise<Report[]> {
    return this.reportService.getPendingReports();
  }

  async verifyReport(reportId: string, verificationData: VerifyReportRequest): Promise<{ incident?: Incident; message: string }> {
    const { verified, priority } = verificationData;

    if (typeof verified !== 'boolean') {
      throw new AppError('Verification status is required', 400);
    }

    const report = await this.db.getReport(reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    if (verified) {
      await this.reportService.updateReportStatus(reportId, 'VERIFIED' as any);

      const incident = await this.db.createIncident({
        report_id: reportId,
        status: IncidentStatus.NEW,
        priority: priority || Priority.MEDIUM
      });

      await this.createAutoAlert(incident.id, report);

      return {
        incident,
        message: 'Report verified and incident created'
      };
    } else {
      await this.reportService.updateReportStatus(reportId, 'REJECTED' as any);
      return {
        message: 'Report rejected'
      };
    }
  }

  async getIncidents(status?: IncidentStatus): Promise<Incident[]> {
    if (status) {
      return this.db.getIncidentsByStatus(status);
    }
    return this.db.getAllIncidents();
  }

  async getIncidentById(incidentId: string): Promise<Incident | null> {
    const incident = await this.db.getIncident(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }
    return incident;
  }

  async updateIncident(incidentId: string, updateData: { priority?: Priority; status?: IncidentStatus }): Promise<Incident> {
    const incident = await this.db.getIncident(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    if (updateData.priority && !Object.values(Priority).includes(updateData.priority)) {
      throw new AppError('Invalid priority', 400);
    }

    if (updateData.status && !Object.values(IncidentStatus).includes(updateData.status)) {
      throw new AppError('Invalid status', 400);
    }

    const updatedIncident = await this.db.updateIncident(incidentId, updateData);
    if (!updatedIncident) {
      throw new AppError('Failed to update incident', 500);
    }

    return updatedIncident;
  }

  async deleteIncident(incidentId: string): Promise<void> {
    const incident = await this.db.getIncident(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    await this.db.deleteIncident(incidentId);
  }

  async assignResponder(incidentId: string, assignmentData: AssignResponderRequest): Promise<Incident> {
    const { responder_id } = assignmentData;

    if (!responder_id) {
      throw new AppError('Responder ID is required', 400);
    }

    const incident = await this.db.getIncident(incidentId);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    if (incident.status !== IncidentStatus.NEW) {
      throw new AppError('Incident cannot be assigned in current status', 400);
    }

    await this.db.updateResponderStatus(responder_id, {
      availability: 'BUSY' as any
    });

    const updatedIncident = await this.db.updateIncident(incidentId, {
      assigned_responder_id: responder_id,
      status: IncidentStatus.ASSIGNED
    });

    if (!updatedIncident) {
      throw new AppError('Failed to update incident', 500);
    }

    return updatedIncident;
  }

  private async createAutoAlert(incidentId: string, report: Report): Promise<void> {
    if (report.severity === 'HIGH') {
      await this.db.createAlert({
        incident_id: incidentId,
        message: `High severity incident: ${report.title}`,
        priority: 'CRITICAL' as any
      });
    }
  }
}
