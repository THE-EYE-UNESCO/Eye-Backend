import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { CreateReportRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async createReport(req: AuthRequest, res: Response) {
    try {
      const reportData: CreateReportRequest = req.body;
      const citizenId = req.user?.id;

      const report = await this.reportService.createReport(reportData, citizenId);

      res.status(201).json({
        message: 'Report created successfully',
        report
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to create report' });
    }
  }

  async getReport(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const citizenId = req.user?.id;
      const reportId = Array.isArray(id) ? id[0] : id;

      const report = await this.reportService.getReportById(reportId, citizenId);

      res.json({ report });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to fetch report' });
    }
  }

  async getReportStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const citizenId = req.user?.id;
      const reportId = Array.isArray(id) ? id[0] : id;

      const status = await this.reportService.getReportStatus(reportId, citizenId);

      res.json({ status });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to fetch report status' });
    }
  }
}
