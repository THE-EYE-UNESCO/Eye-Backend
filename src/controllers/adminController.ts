import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { VerifyReportRequest, AssignResponderRequest, ReportStatus, IncidentStatus, Priority } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const dashboard = {
        totalReports: 150,
        activeIncidents: 12,
        resolvedIncidents: 138,
        availableResponders: 8,
        busyResponders: 4
      };

      res.json({ dashboard });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  }

  async getPendingReports(req: AuthRequest, res: Response) {
    try {
      const reports = [
        {
          id: uuidv4(),
          title: 'Fire Outbreak',
          description: 'Fire reported in residential area',
          category: 'Fire',
          severity: 'HIGH',
          latitude: -1.943,
          longitude: 30.059,
          status: ReportStatus.PENDING,
          created_at: new Date()
        }
      ];

      res.json({ reports });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending reports' });
    }
  }

  async verifyReport(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { verified, priority }: VerifyReportRequest = req.body;

      if (typeof verified !== 'boolean') {
        throw new AppError('Verification status is required', 400);
      }

      if (verified) {
        const incidentId = uuidv4();
        
        const incident = {
          id: incidentId,
          report_id: id,
          status: IncidentStatus.NEW,
          priority: priority || Priority.MEDIUM,
          created_at: new Date()
        };

        res.json({
          message: 'Report verified and incident created',
          incident
        });
      } else {
        res.json({
          message: 'Report rejected'
        });
      }
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to verify report' });
    }
  }

  async getIncidents(req: AuthRequest, res: Response) {
    try {
      const incidents = [
        {
          id: uuidv4(),
          report_id: uuidv4(),
          status: IncidentStatus.ASSIGNED,
          priority: Priority.HIGH,
          assigned_responder_id: uuidv4(),
          created_at: new Date()
        }
      ];

      res.json({ incidents });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch incidents' });
    }
  }

  async assignResponder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { responder_id }: AssignResponderRequest = req.body;

      if (!responder_id) {
        throw new AppError('Responder ID is required', 400);
      }

      const incident = {
        id,
        assigned_responder_id: responder_id,
        status: IncidentStatus.ASSIGNED
      };

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
