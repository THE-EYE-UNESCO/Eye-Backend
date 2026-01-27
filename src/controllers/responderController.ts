import { Request, Response } from 'express';
import { ResponderService } from '../services/responderService';
import { UpdateIncidentStatusRequest, CreateEvidenceRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class ResponderController {
  private responderService: ResponderService;

  constructor() {
    this.responderService = new ResponderService();
  }

  async getAssignedIncidents(req: AuthRequest, res: Response) {
    try {
      const responderId = req.user?.id;
      if (!responderId) {
        throw new AppError('Responder ID not found', 400);
      }

      const incidents = await this.responderService.getAssignedIncidents(responderId);
      res.json({ incidents });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to fetch assigned incidents' });
    }
  }

  async getIncidentDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const incidentId = Array.isArray(id) ? id[0] : id;
      const responderId = req.user?.id;
      
      if (!responderId) {
        throw new AppError('Responder ID not found', 400);
      }

      const incidentDetails = await this.responderService.getIncidentDetails(incidentId, responderId);
      res.json({ incident: incidentDetails });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to fetch incident details' });
    }
  }

  async updateIncidentStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const incidentId = Array.isArray(id) ? id[0] : id;
      const statusUpdate: UpdateIncidentStatusRequest = req.body;
      const responderId = req.user?.id;
      
      if (!responderId) {
        throw new AppError('Responder ID not found', 400);
      }

      const incident = await this.responderService.updateIncidentStatus(incidentId, statusUpdate, responderId);
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
      const incidentId = Array.isArray(id) ? id[0] : id;
      const evidenceData: CreateEvidenceRequest = req.body;
      const responderId = req.user?.id;
      
      if (!responderId) {
        throw new AppError('Responder ID not found', 400);
      }

      const evidence = await this.responderService.uploadEvidence(incidentId, evidenceData, responderId);
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
