import { Router } from 'express';
import { ResponderController } from '../controllers/responderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();
const responderController = new ResponderController();

router.use(authenticate);
router.use(authorize(UserRole.RESPONDER));

router.get('/incidents', (req, res) => responderController.getAssignedIncidents(req, res));
router.get('/incidents/:id', (req, res) => responderController.getIncidentDetails(req, res));
router.get('/reports', (req, res) => responderController.getAllReports(req, res));
router.patch('/incidents/:id/status', (req, res) => responderController.updateIncidentStatus(req, res));
router.post('/incidents/:id/evidence', (req, res) => responderController.uploadEvidence(req, res));

export { router as responderRoutes };
