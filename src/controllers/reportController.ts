import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CreateReportRequest, ReportStatus, Severity } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class ReportController {
  async createReport(req: AuthRequest, res: Response) {
    try {
      const { title, description, category, severity, latitude, longitude }: CreateReportRequest = req.body;

      if (!title || !description || !category || !severity || latitude === undefined || longitude === undefined) {
        throw new AppError('All fields are required', 400);
      }

      const reportId = uuidv4();
      const citizenId = req.user?.id;

      const report = {
        id: reportId,
        citizen_id: citizenId,
        title,
        description,
        category,
        severity: severity as Severity,
        latitude,
        longitude,
        status: ReportStatus.PENDING,
        created_at: new Date()
      };

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

      const report = {
        id,
        citizen_id: req.user?.id,
        title: 'Sample Fire Report',
        description: 'Fire reported in residential area',
        category: 'Fire',
        severity: Severity.HIGH,
        latitude: -1.943,
        longitude: 30.059,
        status: ReportStatus.PENDING,
        created_at: new Date()
      };

      res.json({ report });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch report' });
    }
  }

  async getReportStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const status = {
        reportId: id,
        status: ReportStatus.PENDING,
        message: 'Your report is pending verification'
      };

      res.json({ status });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch report status' });
    }
  }
}
