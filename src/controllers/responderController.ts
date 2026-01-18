import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UpdateIncidentStatusRequest, CreateEvidenceRequest, IncidentStatus } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class ResponderController {
  async getAssignedIncidents(req: AuthRequest, res: Response) {
    try {
      const responderId = req.user?.id;

      const incidents = [
        {
          id: uuidv4(),
          report_id: uuidv4(),
          status: IncidentStatus.ASSIGNED,
          priority: 'HIGH',
          assigned_responder_id: responderId,
          created_at: new Date()
        }
      ];

      res.json({ incidents });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch assigned incidents' });
    }
  }

  async getIncidentDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const incident = {
        id,
        report_id: uuidv4(),
        status: IncidentStatus.ASSIGNED,
        priority: 'HIGH',
        assigned_responder_id: req.user?.id,
        created_at: new Date(),
        report: {
          title: 'Fire Outbreak',
          description: 'Fire reported in residential area',
          category: 'Fire',
          severity: 'HIGH',
          latitude: -1.943,
          longitude: 30.059
        }
      };

      res.json({ incident });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch incident details' });
    }
  }

  async updateIncidentStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status }: UpdateIncidentStatusRequest = req.body;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const validStatuses = Object.values(IncidentStatus);
      if (!validStatuses.includes(status as IncidentStatus)) {
        throw new AppError('Invalid status', 400);
      }

      const incident = {
        id,
        status,
        updated_at: new Date()
      };

      res.json({
        message: 'Incident status updated successfully',
        incident
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to update incident status' });
    }
  }

  async uploadEvidence(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { file_url, note }: CreateEvidenceRequest = req.body;

      if (!file_url) {
        throw new AppError('File URL is required', 400);
      }

      const evidence = {
        id: uuidv4(),
        incident_id: id,
        uploaded_by: req.user?.id,
        file_url,
        note,
        created_at: new Date()
      };

      res.status(201).json({
        message: 'Evidence uploaded successfully',
        evidence
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to upload evidence' });
    }
  }
}
