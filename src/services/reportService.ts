import { DatabaseService } from './databaseService';
import { CreateReportRequest, Report, ReportStatus, Severity } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ReportService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async createReport(reportData: CreateReportRequest, citizenId?: string): Promise<Report> {
    const { title, description, category, severity, latitude, longitude, address, landmark } = reportData;

    if (!title || !description || !category || !severity || latitude === undefined || longitude === undefined) {
      throw new AppError('All fields are required', 400);
    }

    if (!Object.values(Severity).includes(severity)) {
      throw new AppError(`Invalid severity level: ${severity}`, 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new AppError('Invalid coordinates', 400);
    }

    const report = await this.db.createReport({
      citizen_id: citizenId,
      title,
      description,
      category,
      severity,
      latitude,
      longitude,
      address,
      landmark,
      status: ReportStatus.PENDING
    });

    return report;
  }

  async getReportById(reportId: string, citizenId?: string): Promise<Report | null> {
    const report = await this.db.getReport(reportId);
    
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    if (report.citizen_id && report.citizen_id !== citizenId) {
      throw new AppError('Access denied', 403);
    }

    return report;
  }

  async getReportStatus(reportId: string, citizenId?: string): Promise<{ reportId: string; status: ReportStatus; message: string }> {
    const report = await this.getReportById(reportId, citizenId);
    
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    const statusMessages = {
      [ReportStatus.PENDING]: 'Your report is pending verification',
      [ReportStatus.VERIFIED]: 'Your report has been verified and is being processed',
      [ReportStatus.REJECTED]: 'Your report was rejected',
      [ReportStatus.RESOLVED]: 'Your report has been resolved'
    };

    return {
      reportId,
      status: report.status,
      message: statusMessages[report.status]
    };
  }

  async getPendingReports(): Promise<Report[]> {
    return this.db.getReportsByStatus(ReportStatus.PENDING);
  }

  async getAllReports(): Promise<Report[]> {
    return this.db.getAllReports();
  }

  async getReportsByCitizen(citizenId: string): Promise<Report[]> {
    return this.db.getReportsByCitizen(citizenId);
  }

  async updateReport(reportId: string, updateData: Partial<CreateReportRequest>): Promise<Report | null> {
    const report = await this.db.getReport(reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    if (updateData.severity && !Object.values(Severity).includes(updateData.severity)) {
      throw new AppError('Invalid severity level', 400);
    }

    if (updateData.latitude !== undefined && (updateData.latitude < -90 || updateData.latitude > 90)) {
      throw new AppError('Invalid latitude', 400);
    }

    if (updateData.longitude !== undefined && (updateData.longitude < -180 || updateData.longitude > 180)) {
      throw new AppError('Invalid longitude', 400);
    }

    return this.db.updateReport(reportId, updateData);
  }

  async deleteReport(reportId: string): Promise<void> {
    const report = await this.db.getReport(reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    await this.db.deleteReport(reportId);
  }

  async updateReportStatus(reportId: string, status: ReportStatus): Promise<Report | null> {
    if (!Object.values(ReportStatus).includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    return this.db.updateReport(reportId, { status });
  }
}
