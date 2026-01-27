import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { VerifyReportRequest, AssignResponderRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const dashboard = await this.adminService.getDashboardMetrics();
      res.json({ dashboard });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  }

  async getPendingReports(req: AuthRequest, res: Response) {
    try {
      const reports = await this.adminService.getPendingReports();
      res.json({ reports });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending reports' });
    }
  }

  async verifyReport(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const reportId = Array.isArray(id) ? id[0] : id;
      const verificationData: VerifyReportRequest = req.body;

      const result = await this.adminService.verifyReport(reportId, verificationData);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to verify report' });
    }
  }

  async getIncidents(req: AuthRequest, res: Response) {
    try {
      const incidents = await this.adminService.getIncidents();
      res.json({ incidents });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch incidents' });
    }
  }

  async assignResponder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const incidentId = Array.isArray(id) ? id[0] : id;
      const assignmentData: AssignResponderRequest = req.body;

      const incident = await this.adminService.assignResponder(incidentId, assignmentData);
      res.json({
        message: 'Responder assigned successfully',
        incident
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to assign responder' });
    }
  }
}
